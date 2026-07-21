import { app } from "./src/app.js";
import { prisma } from "./src/config/database.js";
import { Server } from "http";

async function runTest() {
  let server: Server;
  try {
    console.log("Connecting to DB...");
    await prisma.$connect();

    console.log("Setting up test data...");
    // Create a dummy user
    const user = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@test.com`,
        name: "Test User",
        slug: `test-slug-${Date.now()}`,
      }
    });

    // Create a dummy event type
    const eventType = await prisma.eventTypes.create({
      data: {
        hostId: user.id,
        title: "Test Event",
        slug: `test-event-${Date.now()}`,
        durationMinutes: 30,
      }
    });

    // Create an available slot
    const slotStart = new Date();
    slotStart.setHours(slotStart.getHours() + 1); // 1 hour in the future
    const slotEnd = new Date(slotStart.getTime() + 30 * 60000);

    const slot = await prisma.slots.create({
      data: {
        hostId: user.id,
        eventId: eventType.id,
        startAt: slotStart,
        endAt: slotEnd,
        status: "AVAILABLE"
      }
    });

    console.log(`Created user ${user.id}, event ${eventType.id}, slot ${slot.id}`);

    // Start server
    const PORT = 9999;
    server = app.listen(PORT, () => console.log(`Test server running on ${PORT}`));

    // Test POST /bookings/new
    console.log("Testing POST /bookings/new...");
    const postRes = await fetch(`http://localhost:${PORT}/bookings/new`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": user.id.toString(),
      },
      body: JSON.stringify({
        slotId: slot.id,
        inviteeEmail: "invitee@test.com",
        inviteeName: "John Doe",
        inviteeNotes: "Test booking",
      }),
    });
    
    const postData = await postRes.json();
    console.log("POST Response status:", postRes.status);
    console.log("POST Response body:", JSON.stringify(postData, null, 2));

    if (postRes.status !== 201) {
      throw new Error("POST /bookings/new failed");
    }

    // Test GET /bookings
    console.log("Testing GET /bookings?status=CONFIRMED...");
    const getRes = await fetch(`http://localhost:${PORT}/bookings?status=CONFIRMED`, {
      method: "GET",
      headers: {
        "x-user-id": user.id.toString(),
      },
    });

    const getData = await getRes.json();
    console.log("GET Response status:", getRes.status);
    console.log("GET Response body:", JSON.stringify(getData, null, 2));

    if (getRes.status !== 200 || !getData.data || getData.data.length === 0) {
      throw new Error("GET /bookings failed");
    }

    console.log("All tests passed successfully!");

    // Cleanup
    await prisma.booking.deleteMany({ where: { hostId: user.id } });
    await prisma.slots.deleteMany({ where: { hostId: user.id } });
    await prisma.eventTypes.deleteMany({ where: { hostId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });

  } catch (err) {
    console.error("Test failed:", err);
  } finally {
    if (server!) server.close();
    await prisma.$disconnect();
    process.exit(0);
  }
}

runTest();
