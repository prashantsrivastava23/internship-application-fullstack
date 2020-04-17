//The following classes alter the content of the HTML Page using HTMLRewriter
class TitleTabWrite {
  element(x) {
      x.prepend('This is ')
  }
}
class TitleWrite {
  element(x) {
      x.append(' of Load Balancer')
  }
}
class BodyWrite {
  element(x) {
      x.setInnerContent('CloudFlare Summer Internship Coding Challenge<br><a style="color: #8ec7e6" href="https://github.com/prashantsrivastava23/internship-application-fullstack"><b>MY SOLUTION</b></a>', { html: true} )
  }
}
class URLWrite {
  element(x) {
      x.setAttribute('href', 'https://www.linkedin.com/in/prashant-srivastava-0050a3165')
      x.setInnerContent('Profile of Prashant Srivastava')
  }
}

const WEBSITE = new URL('https://cfw-takehome.developers.workers.dev/api/variants')       //website to request
const COOKIE_NAME = 'variant'

//changing the URLs and descriptions
const REWRITER  = new HTMLRewriter().on('title',new TitleTabWrite()).on('h1#title',new TitleWrite()).on('p#description',new BodyWrite()).on('a#url',new URLWrite())

async function handleRequest(request) {
  let inputcookie = false
  const vcookie = getCookie(request, COOKIE_NAME)       //Requesting for cookies
  let vURL = (!vcookie) ? vcookie : null        //getting the variant from the cookies 
  if (!vURL) {        //cookies are not present
      let vr = await fetch(WEBSITE.href, { cf: { cacheTtl: 500 } })       //requesting the website
      let vj = await vr.json()
      vURL = Math.random() < 0.5 ? vj.variants[0] : vj.variants[1]        //diverting using A/B testing
      inputcookie = true        //cookies need to be inserted
  }
  let rURL = new URL(request.url)
  let aURL = vURL + rURL.pathname + rURL.search
  let response = await fetch(aURL, request)
  let resultresponse = REWRITER.transform(response)       //changing URLs and content of the website
  if (inputcookie) {
      const eURL = vURL
      let endate = new Date()
      endate.setYear(endate.getYear() + 1)        //making the cookie persistent for 1 year
      resultresponse.headers.append('Set-Cookie', `${COOKIE_NAME}=${eURL}; Expires=${endate.toGMTString()}; path=/;`)
  }
  return resultresponse
}
/* This cookie grabing code is taken from the following template 
 * https://developers.cloudflare.com/workers/templates/pages/cookie_extract/

 * The function has two parameters (i) request - incoming request (ii) name - name of the cookie to grab
 */
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
