# Wiki-with-5-routes application

This project is created to execute on a Node-server five types of requests based on routes and request parameters. Customer can add new wiki-page, check the list of already existing pages and view each page separately. As customer can use tags inside his pages, there are also two types of requests handling all existing tags inside all pages and check to which pages one specific tags is related. After each request there qre pre-defined responses and error handling blocks for any case.

## 0. Preparation step: existing code

Review already existing code in order to get the list of required functions: `readFile`, `writeFile` and `readDir` and another additional helpful staff, such as REGEX for title match, directory and file path and few all-request handlers (`app.use`)

## 1. Coding step: handle customer's requests

We need to create 5 routes described in the `./wiki-server/server.js` file.

### Get an Existing Page

Calling this route should return a response with a property called body containing the text stored inside the file with the name :slug

- method: GET
- path: "/api/page/:slug"
- success response: {status: 'ok', body: `<file contents>`}
- failure response: {status: 'error', message: 'Page does not exist.'}

File path is received via `slugToPath` function converting provided in `req.params.slug` filename into the absolute path. Then asynchronous `readFile` function display the content in response. If such page does not exist or an error happened, pre-defined failure response is sent.

### Post a New Page

Calling this route with a body property in the body of your HTTP Request, and a file name in the :slug URL parameter will add a new markdown file to the `./wiki-server/data` directory

- method: POST
- path: "/api/page/:slug"
- body: {body: `<file content>`}
- success response: {status: 'ok'}
- failure response: {status: 'error', message: 'Could not write page.'}

This method is parsing request body as a raw content in order to extract the correct format, then received an absolute path via `slugToPath` function converting provided in `req.params.slug` filename and finally with the help of `writeFile` function write the content to this file. If file does not exist, it will be created. In all other cases pre-defined error response is sent.

### Get All Page Names

Calling this route will return a response with a property called pages which is an array containing all of the file names in `./wiki-server/data`.

- method: GET
- path: "/api/page/all"
- success response: {status:'ok', pages: ['fileName', 'otherFileName']}
- failure response: none

This route use helpful `readDir` function to extract directory file list and send it as a response. As we should provide only filenames without extentions, `slice` allow to cut redundant characters. In case of any failures all regarding information provided only to server console output.

### Get All tags

Calling this route will return a response with a property called tags which is an array containing all of the tagged words in all of the files of `./wiki-server/data`. Tagged words are any word in a file with a # in front of it, like so #tree. Or #table,

- method: GET
- path: "/api/tags/all"
- success response: {status:'ok', tags: ['tagName', 'otherTagName']}
- failure response: (none)

This route uses `readDir` and `readFIle` functions to loop through all files and all their contents in order to receive full list of existing tags. Finally, this list is converted to containing only unique and valid values. In case of any failures all regarding information provided only to server console output.

### Get Page Names by Tag

Calling this route will return a response with a property called tag which indicates which tag was used to search, and a property called pages which is an array of all the file names containing that tag

- method: GET
- path: "/api/tags/:tag"
- success response: {status:'ok', tag: 'tagName', pages: ['tagName', 'otherTagName']}
- failure response: (none)

This request handler uses `readDir` and `readFIle` functions to loop through all files and all their contents in order to receive full list files where requested tag exists. Finally, this list is convert file list to send only filenames without extentions via `slice` method. In case of any failures all regarding information provided only to server console output.

## 2. Documentation: development strategy

Project description with the step by step coding explanation provided in `development-strategy.md` file.
