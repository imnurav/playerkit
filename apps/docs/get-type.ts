import { source } from './src/lib/source';
const page = source.getPage(['core', 'overview']);
if (page) {
  const data = page.data;
  console.log(Object.keys(data));
}
