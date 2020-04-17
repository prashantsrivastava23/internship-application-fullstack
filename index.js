class TitleWrite {
  element(x) {
      x.prepend('This is ')
  }
}
class BodyWrite {
  element(x) {
      x.setInnerContent('CloudFlare Summer Internship Coding Challenge<br><a style="color: #536975" href="https://github.com/prashantsrivastava23/internship-application-fullstack"><b>MY SOLUTION</b></a>', { html: true} )
  }
}
class URLWrite {
  element(x) {
      x.setAttribute('href', 'https://www.linkedin.com/in/prashant-srivastava-0050a3165')
      x.setInnerContent('Profile of Prashant Srivastava')
  }
}
const WEBSITE = new URL('https://cfw-takehome.developers.workers.dev/api/variants')
const COOKIE_NAME = 'variant'
const REWRITER  = new HTMLRewriter()
  .on('title', new TitleWrite())
  .on('p#description', new BodyWrite())
  .on('a#url', new URLWrite())

async function handleRequest(request) {
  let inputcookie = false
  const vcookie = getCookie(request, COOKIE_NAME)
  let vURL = (!vcookie) ? vcookie : null
  if (!vURL) {
      let vr = await fetch(WEBSITE.href, { cf: { cacheTtl: 500 } })
      let vj = await vr.json()
      vURL = Math.random() < 0.5 ? vj.variants[0] : vj.variants[1]
      inputcookie = true
  }
  let rURL = new URL(request.url)
  let aURL = vURL + rURL.pathname + rURL.search
  let response = await fetch(aURL, request)
  let variantResponse = REWRITER.transform(response)
  if (inputcookie) {
      const eURL = vURL
      let endate = new Date()
      endate.setYear(endate.getYear() + 1)
      variantResponse.headers.append('Set-Cookie', `${COOKIE_NAME}=${eURL}; Expires=${endate.toGMTString()}; Secure; HttpOnly; path=/;`)
  }
  return variantResponse
}
function getCookie(request, name) {
  let cookieString = request.headers.get('Cookie')
  if (cookieString) {
      let cookies = cookieString.split(';')
      for (const cookie of cookies) {
          let cookieName = cookie.split('=')[0].trim()
          if (cookieName === name) {
              let cookieVal = cookie.split('=')[1]
              return cookieVal
          }
      }
  }
  return null
}
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
