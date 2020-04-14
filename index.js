class ElementHandler {
  constructor(attributeName) {
    this.attributeName = attributeName
  }

  element(element) {
    if (element.tagName === 'a') {
      const attribute = element.getAttribute(this.attributeName)
      element.setAttribute(
        'href',
        attribute.replace(
          'https://cloudflare.com',
          'https://imgur.com/IszCP1Z', //Dont worry, SFW link
        ),
      )
      element.setInnerContent('My previously arranged coop')
    } else if (element.tagName === 'h1') {
      element.setInnerContent('Thank you for reviewing my test')
    } else if (element.tagName === 'p') {
      element.setInnerContent(
        'My previously arranged coop was unfortunately cancelled due to Coronavirus, so this opportunity is very much appreciated',
      )
    }
  }
}

function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
    let cookies = cookieString.split(';')
    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }
  return result
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * @param {Request} request
 */

async function handleRequest(request) {
  let headers = { 'content-type': 'text/html' }
  const res = await fetch(
    'https://cfw-takehome.developers.workers.dev/api/variants',
  )
  if (res.status !== 200) {
    return new Response('Takehome site did not give a response', {
      headers: { 'content-type': 'text/plain' },
    })
  }
  const body = await res.json()
  const variants = body.variants

  let index = getCookie(request, 'Index')
  if (index === null) {
    index = Math.floor(Math.random() * 2)
    headers['Set-Cookie'] = `Index=${index}`
  }

  let result = await fetch(variants[index])
  //Intentionally did not use triple equal, as when reading from cookie, index will be a string, so both int and string values are valid
  if (index == 0) {
    const rewriter = new HTMLRewriter()
      .on('a', new ElementHandler('href'))
      .on('h1', new ElementHandler())
      .on('p#description', new ElementHandler())
    result = rewriter.transform(result)
  }

  return new Response(result.body, {
    headers: headers,
  })
}
