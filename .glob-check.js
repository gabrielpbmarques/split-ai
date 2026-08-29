const { importClassesFromDirectories } = require('/Users/gabrielbutkus/Documents/Projects/split-ai/node_modules/typeorm/util/DirectoryExportedClassesLoader.js');
const dir = '/Users/gabrielbutkus/Documents/Projects/split-ai/dist/src';
(async () => {
  const classes = await importClassesFromDirectories({ log: () => {} }, [dir + '/**/*.entity{.ts,.js}']);
  const names = classes.map(c => c.name).sort();
  console.log('count:', names.length);
  console.log(names.join(', '));
  console.log('--- target entities present? ---');
  ['FeatureEntity','NotificationEntity','SubscriptionEntity'].forEach(n => console.log(' ', n, names.includes(n)));
})();
