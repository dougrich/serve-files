# HTML

HTML content can be edited by GETing the content, then POSTing the updated content through a form.

When GETed, it will add a hidden 'etag' field into the content. This field will contain the current md5 hash of the document, and will be used to resolve contention. When posting, the etag field must match the current hash.

When POSTed as `application/x-www-urlencoded`, it will:
  - read the current file on disk
  - verify the etags match
  - update fields in the current file which match posted values
  - ignore unknown fields
  - write out the updated HTML, replacing the previous version
  - serve as normal

Other operations are ignored.