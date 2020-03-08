tea = require("../dist/tea.js")
ghost = require("ghostjs")

tea() // init tea

/*
test.beforeEach = () => console.log("before each")
test.beforeAll = () => console.log("before all")
test.afterEach = () => console.log("after each")
test.afterAll = () => console.log("after all")
*/

// begin tests

tea() // init tea

test("check the page loaded OK", async () => {
  // check page title
  await ghost.open("http://google.com")
  let pageTitle = await ghost.pageTitle()
  assert.strictEquals(pageTitle, "Google")

  // check the content of the body
  let body = await ghost.findElement("body")
  assert.strictEquals(await body.isVisible(), true)

  // ...
})
