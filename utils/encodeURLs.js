$("a[href]").each(function(){
  let a = $(this);
  let href = a.attr('href');
  href = href && url.resolve(requestURL, href);
  href = href && encodeURI(decodeURI(href));
  a.attr('href', href);
})