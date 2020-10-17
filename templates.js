module.exports = {
  CONTAINER: '<?xml version="1.0"?>\n' +
             '<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">\n' +
             '  <rootfiles>\n' +
             '    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>\n' +
             '  </rootfiles>\n' +
             '</container>',
  MIMETYPE: 'application/epub+zip',
  CONTENT: [// 0
            '<?xml version="1.0" encoding="UTF-8" ?>\n' +
            '<package xmlns="http://www.idpf.org/2007/opf" unique-identifier="BookID" version="2.0" xml:lang="de">\n' +
            '  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:opf="http://www.idpf.org/2007/opf">\n' +
            '    <dc:title>', // insert title here
            // 1
                '</dc:title>\n' +
            '    <dc:identifier id="BookID" opf:scheme="CustomID">', // insert identifier here
            // 2
                '</dc:identifier>\n' +
            '    <meta name="cover" content="coverpage"/>\n' +
            '  </metadata>\n' +
            '  <manifest>\n' +
            '    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>\n' +
            '    <item id="coverpage" href="img/title-woz.jpg" media-type="image/jpeg"/>\n' +
            '    <item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>\n', // insert more manifest items here
            // 3
            '  </manifest>\n' +
            '  <spine toc="ncx" >\n', // insert spine items here
            // 4
            '  </spine>\n' +
            // '  <guide>\n' +
            // '    <reference type="title-page" title="Title Page" href="title.xhtml"/>\n' +
            // '    <reference type="text" title="Content" href="content.xhtml"/>\n' +
            // '    <reference type="copyright-page" title="Copyright" href="end.xhtml"/>\n' +
            // '  </guide>\n' +
            '</package>'
          ],
  TOC: [ // 0
        '<?xml version="1.0" encoding="UTF-8" ?>\n' +
        '<!DOCTYPE ncx PUBLIC "-//NISO//DTD ncx 2005-1//EN" "http://www.daisy.org/z3986/2005/ncx-2005-1.dtd">\n\n' +
        '<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="de">\n' +
        '  <head>\n' +
        '    <meta name="dtb:uid" content="', // insert identifier here
        // 1
             '"/>\n' +
        '    <meta name="dtb:depth" content="3"/>\n' +
        '    <meta name="dtb:totalPageCount" content="0"/>\n' +
        '    <meta name="dtb:maxPageNumber" content="0"/>\n' +
        '  </head>\n' +
        '  <docTitle>\n' +
        '    <text>', // insert book title here
        // 2
            '</text>\n' +
        '  </docTitle>\n' +
        '  <docAuthor>\n' +
        '    <text>', // insert author here
        // 3
            '</text>\n' +
        '  </docAuthor>\n' +
        '  <navMap>\n', // insert all navPoints here
        // 4
        '  </navMap>\n' +
        '</ncx>'
      ],
  TOC_TITLE_NAVPOINT: '    <navPoint class="title" id="navPoint-1" playOrder="1">\n' +
                      '      <navLabel>\n' +
                      '        <text>Titelseite</text>\n' +
                      '      </navLabel>\n' +
                      '      <content src="title.xhtml"/>\n' +
                      '    </navPoint>\n',
  TEXTFILE: [ // 0
            '<?xml version="1.0" encoding="UTF-8" ?>\n' +
            '<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">\n' +
            '<html xmlns="http://www.w3.org/1999/xhtml"  xml:lang="de" lang="de" >\n' +
            '  <head>\n' +
            '    <title>', // insert page title here
            // 1
                '</title>\n' +
            '	 </head>\n\n', // insert body here
            // 2
            '\n</html>'
          ]
}
