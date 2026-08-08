import { prisma } from './src/config/database.js';

async function run() {
  const b = await prisma.booking.findFirst({ orderBy: { id: 'desc' } });
  console.log(b);
  
  if (b) {
    const { startCreateGoogleCalendarEventWorkflow } = await import('./src/temporal/client.js');
    await startCreateGoogleCalendarEventWorkflow(b.id);
    console.log('Triggered google calendar workflow for', b.id);
  }
}

run().catch(console.error).finally(() => process.exit(0));
