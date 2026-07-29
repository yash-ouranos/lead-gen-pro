const fs = require('fs');
const glob = require('glob');

const files = [
  'app/(app)/templates/page.tsx',
  'app/(app)/templates/actions.ts',
  'app/(app)/leads/page.tsx',
  'app/(app)/dashboard/page.tsx',
  'app/(app)/campaigns/new/actions.ts',
  'app/(app)/email/compose/[leadId]/page.tsx',
  'app/(app)/email/compose/[leadId]/actions.ts',
  'app/api/referrals/[id]/route.ts',
  'app/api/referrals/route.ts',
  'app/api/emails/sync/route.ts',
  'app/api/promotions/[id]/route.ts',
  'app/api/promotions/route.ts',
  'app/api/leads/[id]/route.ts',
  'app/api/leads/route.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/session\.user\.id/g, 'session.user.tenantId');
  fs.writeFileSync(file, content);
  console.log('Updated ' + file);
});
