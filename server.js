const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const util = require('util');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Uncomment this out once you've made your first route.
app.use(express.static(path.join(__dirname, 'client', 'build')));

// some helper functions you can use
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const readDir = util.promisify(fs.readdir);

// some more helper functions
const DATA_DIR = 'data';
const TAG_RE = /#\w+/g;
function slugToPath(slug) {
  const filename = `${slug}.md`;
  return path.join(DATA_DIR, filename);
}
function jsonOK(res, data) {
  res.json({ status: 'ok', ...data });
}
function jsonError(res, message) {
  res.json({ status: 'error', message });
}

app.get('/', (req, res) => {
  res.json({ wow: 'it works!' });
});

// If you want to see the wiki client, run npm install && npm build in the client folder,
// then comment the line above and uncomment out the lines below and comment the line above.
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });

// GET: '/api/page/:slug'
// success response: {status: 'ok', body: '<file contents>'}
// failure response: {status: 'error', message: 'Page does not exist.'}
app.get('/api/page/:slug', async (req, res) => {
  const filePath = slugToPath(req.params.slug);
  try {
    const data = await readFile(filePath, 'utf-8');
    jsonOK(res, data);
  } catch (err) {
    console.error(err);
    message = 'Page does not exist.';
    jsonError(res, message);
  }
});

// POST: '/api/page/:slug'
// body: {body: '<file text content>'}
// success response: {status: 'ok'}
// failure response: {status: 'error', message: 'Could not write page.'}
app.use('/api/page/:slug', bodyParser.raw({ type: 'text/plain' }));
app.post('/api/page/:slug', async (req, res) => {
  const filePath = slugToPath(req.params.slug);
  const content = req.body.toString();
  console.log(content);
  try {
    await writeFile(filePath, content);
    res.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    message = 'Could not write page.';
    jsonError(res, message);
  }
});

// GET: '/api/pages/all'
// success response: {status:'ok', pages: ['fileName', 'otherFileName']}
//  file names do not have .md, just the name!
// failure response: no failure response
app.get('/api/pages/all', async (req, res) => {
  try {
    const list = await readDir(DATA_DIR);
    let data = [];
    list.forEach((el) => data.push(el.slice(0, -3)));
    console.log(data);
    jsonOK(res, data);
  } catch (err) {
    console.error(err);
  }
});

// GET: '/api/tags/all'
// success response: {status:'ok', tags: ['tagName', 'otherTagName']}
//  tags are any word in all documents with a # in front of it
// failure response: no failure response

app.get('/api/tags/all', async (req, res) => {
  try {
    const list = await readDir(DATA_DIR);
    console.log(list);
    let data = [];
    for (let file of list) {
      //for (String file: list) {
      //for (let file; file < list.length - 1; file++) {
      let info = await readFile(path.join(DATA_DIR, file), 'utf-8');
      let tag = info.match(TAG_RE);
      data = data.concat(tag);
    }
    //remove null elements
    data = data.filter(function (el) {
      return el != null;
    });
    //remove duplications
    let uniq = [...new Set(data)];
    console.log(uniq);
    jsonOK(res, uniq);
  } catch (err) {
    console.error(err);
  }
});

// GET: '/api/tags/:tag'
// success response: {status:'ok', tag: 'tagName', pages: ['tagName', 'otherTagName']}
//  file names do not have .md, just the name!
// failure response: no failure response
app.get('/api/tags/:tag', async (req, res) => {
  try {
    const tagName = '#' + req.params.tag;
    const list = await readDir(DATA_DIR);
    let data = [];
    for (let file of list) {
      let info = await readFile(path.join(DATA_DIR, file), 'utf-8');
      if (info.match(tagName)) {
        data.push(file.slice(0, -3));
      }
    }
    console.log(data);
    res.json({ status: 'ok', tag: tagName, pages: data });
  } catch (err) {
    console.error(err);
  }
});

app.get('/api/page/all', async (req, res) => {
  const names = await fs.readdir(DATA_DIR);
  console.log(names);
  jsonOK(res, {});
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`Wiki app is serving at http://localhost:${port}`));
