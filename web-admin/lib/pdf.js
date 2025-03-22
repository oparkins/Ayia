const Fs            = require('fs');
const { readFile }  = require('fs/promises');
const PDFDocument   = require('pdfkit');
const Refs          = require('./refs');
const Versions      = require('../versions');

class StudyBook {
  /**
   *  A class to generate a study layout for a specific book of the Bible.
   *
   *  :NOTE: Measurements are typically in points: 72 points == 1"
   */

  // Generated PDF Document (via generate()) {PDFDocument};
  doc = null;

  // Default layout
  layout        = {
    layout  : 'landscape',
    margins : {
      top   : 54, // 3/4"
      right : 54,
      bottom: 54,
      left  : 54,
    },
  };

  // The fonts that will be used
  Font  = {
    chapter : {
      name  : 'Chapter',
      size  : 18,  // 1/4"
      source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Bold.otf',
      // :XXX: NOT permitted for OTF fonts
      // family: 'NimbusSans',
    },
    verse : {
      name  : 'Verse',
      size  : 12,
      source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Bold.otf',
      // :XXX: NOT permitted for OTF fonts
      // family: 'NimbusSans',
    },

    text  : {
      name  : 'Text',
      size  : 9,  // 1/8"
      source: '/usr/share/fonts/opentype/urw-base35/NimbusRoman-Regular.otf',
      // :XXX: NOT permitted for OTF fonts
      // family: 'NimbusSans',
    },
  };

  // General text options
  Text_opts = {
    columns     : 2,
    continued   : true,
    features    : [],

    columnGap   : 24, // ~ 5/16"
    lineGap     : 24,
    paragraphGap: 0,
  };

  /**
   *  Generate the PDF for a specific book
   *
   *  @method geneerate
   *  @param  version                 The target version {Version};
   *  @param  book                    The target book {Book};
   *                                    { abbr, name, loc, verses }
   *  @param  [linePerVerse = false]  If truthy, generate each verse as its own
   *                                  line {Boolean};
   *
   *  @return A promise for results {Promise};
   */
  async generate( version, book, linePerVerse = false ) {
    linePerVerse = !!linePerVerse;

    const chapters  = await this._getChapters( version, book );

    this.doc = new PDFDocument( this.layout );

    this._registerFonts( this.doc );

    let curChap = null;

    this.doc.font(     this.Font.chapter.name )
            .fontSize( this.Font.chapter.size )
            .text( book.name,  { ...this.Text_opts, continued: false } );

    Object.entries( chapters ).forEach( ([ref, entry]) => {
      const [abbr, chapText, versText]  = ref.split('.');

      if (chapText.startsWith('INTRO')) { return }

      const chap  = parseInt( chapText );
      const verse = parseInt( versText );

      /*
      console.log('=== ref[ %s ]: abbr[ %s ], chap[ %s : %s ], vers[ %s : %s ]',
                  ref, abbr, chapText, chap, versText, verse);
      // */

      if (chap !== curChap) {
        // New chapter
        this.doc.font(     this.Font.chapter.name )
                .fontSize( this.Font.chapter.size );

        if (! linePerVerse && chap !== 1) {
           this.doc.text( `\n `, this.Text_opts );
        }

        this.doc.text( `${chap} `, this.Text_opts );
        curChap = chap;
      }

      const verse_opts  = { ... this.Text_opts, features: ['sups'] };
      if (linePerVerse) {
        // Line-per-verse
        this.doc.font(     this.Font.verse.name )
                .fontSize( this.Font.verse.size )
                .text(`${verse}`, verse_opts )
                .font(     this.Font.text.name )
                .fontSize( this.Font.text.size )
                .text(`${entry.text}\n `, this.Text_opts);
      } else {
        /* No line seperating verses
         *
         * No-Break-Space
         *    represented similarly to a space character, it prevents an
         *    automatic line break
         *      &nbsp;  \U00A0
         *
         * Figure Space
         *    a space somewhat equal to the figures (0–9) characters.
         *      &#8199; \U2007
         *
         * Narrow No-Break Space
         *    used to separate a suffix from a word stem without indicating a
         *    word boundary. Approximately 1/3 the representative space of a
         *    normal space though it may vary by font
         *      &#8239; &nnbsp; \u202f
         *
         *  Word-Joiner
         *    representative by no visible character, it prohibits a line break
         *    at its position.
         *      \u2060
         *
         * non-breaking, zero-width space
         *      \uFEFF
         */
        this.doc.font(     this.Font.verse.name )
                .fontSize( this.Font.verse.size )
                .text(`  ${verse}\u202f`, verse_opts )
                .font(     this.Font.text.name )
                .fontSize( this.Font.text.size )
                .text(`${entry.text} `, this.Text_opts);

      }
    });

    return this;
  }

  /**
   *  Write the generated PDF to the given file/path.
   *
   *  @method write
   *  @param  path    The target output file/path {String};
   *
   *  @return `this` for a fluent interface;
   */
  write( path ) {
    if (this.doc == null) {
      console.error('The document has not yet been generated');

    } else {
      this.doc.pipe( Fs.createWriteStream( path ) );
      this.doc.end();

      this.doc = null;
    }

    return this;
  }

  /**************************************************************************
   * Protected methods {
   *
   */

  /**
   *  Register the specified fonts in the new PDF document.
   *
   *  @method _registerFonts
   *  @param  doc     The target document {PDFDocument};
   *
   *  @return `this` for a fluent interface;
   *  @protected
   */
  _registerFonts( doc ) {
    Object.values( this.Font ).forEach( (font) => {
      if (font.name == null || font.source == null) {
        return;
      }

      /*
      console.log('>>> Register font [%s%s]: %s',
                  font.name, (font.family ? ` : ${font.family}` : ''),
                  font.source);
      // */

      doc.registerFont( font.name, font.source, font.family );
    });

    return this;
  }

  /**
   *  Retrieve the chapters for the identified book.
   *
   *  @method _getChapters
   *  @param  version   The target version {Version};
   *  @param  book      The target book {Book};
   *                      { abbr, name, loc, verses }
   *
   *  @return A promise for all verses for the target book {Promise};
   *            { %verse-ref%: {  // e.g. '1PE.001.001'
   *                markup: [
   *                  { %type%: ... },
   *                  ...
   *                ],
   *                text:   Raw text of this verse {String};
   *              },
   *              ...
   *            }
   *  @protected
   */
  async _getChapters( version, book ) {
    const res       = {};
    const bookAbbr  = book.abbr;
    const config    = {
      version : version,
      /*
      vers    : versionName,
      // */
    };
    const cacheDir  = await Versions.prepare( config );

    // assert( typeof(cacheDir) === 'string' );
    const jsonPath  = `${cacheDir}/${bookAbbr}.json`;

    /*
    console.log('=== _getChapters( %s ):', bookAbbr, jsonPath);
    // */

    const jsonData  = await readFile( jsonPath );
    const chapters  = JSON.parse( jsonData );

    /*
    console.log('=== _getChapters( %s ): chapters:',
                bookAbbr, chapters);
    // */

    return chapters;

    /************************************************************************/
    let   chapter   = 0;
    let   verse     = 1;

    _lorem().forEach( (para, idex) => {
      if (idex % 10 === 0) {
        chapter++;
        verse = 1;

      } else {
        verse++;
      }

      const ref = Refs.sortable( bookAbbr, chapter, verse );

      res[ ref ] = { markup: null, text: para };
    });

    return res;
  }

  /* Protected methods }
   **************************************************************************/
}

/****************************************************************************
 * Private helpers {
 *
 */

function _lorem() {
  const paragraphs  = [
    `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pellentesque accumsan hendrerit sem sed varius. Duis malesuada ante ac lorem malesuada, non volutpat turpis congue. Nunc euismod velit vitae mattis congue. Donec ante enim, cursus non pellentesque ut, accumsan nec neque. Integer pretium, tortor sed dictum convallis, elit nisl tincidunt nisi, ac sollicitudin erat orci accumsan nulla. Sed purus sem, tincidunt sit amet mi quis, convallis fermentum arcu. Duis a varius nulla, ac facilisis quam. Vivamus vitae dolor egestas, imperdiet elit sed, tempus massa.`,
    `Quisque lobortis facilisis diam ac euismod. Nulla placerat justo ipsum, at elementum risus iaculis sit amet. Donec ac purus placerat, cursus velit nec, porta eros. Praesent consequat commodo urna at maximus. Proin bibendum ex eget velit placerat, vel porttitor leo ultrices. Maecenas porttitor ligula in turpis egestas gravida. Nunc placerat orci vitae purus feugiat mollis quis malesuada massa. Fusce a nisl vel lorem mattis vestibulum. Mauris vel dui enim. Nulla ultricies lectus vitae quam vestibulum dictum. Duis non maximus enim, eu consequat metus. In eget diam sodales, maximus purus euismod, elementum massa. Nulla congue rhoncus diam, et tempor odio accumsan eu. Nam euismod neque sit amet interdum rhoncus. Nulla facilisis arcu in eros sollicitudin, id faucibus justo porta. Ut egestas metus enim, eget condimentum arcu pellentesque rutrum.`,
    `Curabitur auctor lacus pulvinar, pretium elit eu, tempus elit. Mauris eget nisi in diam viverra maximus ac eget mi. Nullam vulputate eleifend lacus et maximus. Nam eget dui purus. Cras auctor, odio sed semper tincidunt, est arcu cursus velit, id pellentesque est leo non leo. Etiam eget felis justo. Donec convallis dignissim lectus eget pharetra. Curabitur tempor metus vitae odio dignissim, sit amet sodales diam scelerisque.`,
    `Donec malesuada viverra turpis, ultricies porttitor lacus viverra et. Nulla facilisi. Pellentesque lobortis convallis dui non aliquam. Etiam ornare massa sed tempor iaculis. Quisque et lacus mi. Ut in nisi et nulla malesuada imperdiet a non ligula. Aenean non nibh semper, ultricies neque non, hendrerit libero. Nullam auctor dictum lorem. Phasellus venenatis sodales tortor, ac dictum quam ornare nec. Mauris eu nibh neque. Curabitur vel facilisis metus. Aenean maximus turpis enim, bibendum gravida nunc hendrerit vel. Duis aliquet non mauris a accumsan. Morbi scelerisque orci eros, eu convallis nisi viverra eget.`,
    `Donec rutrum, ipsum finibus pretium volutpat, mi libero pulvinar lectus, aliquam tincidunt diam arcu eu neque. Praesent neque urna, accumsan mattis enim ac, lobortis viverra neque. Mauris ac diam quam. Sed in condimentum odio, vitae maximus turpis. Suspendisse potenti. Fusce sollicitudin nisl at ex porttitor, ac feugiat erat posuere. Nullam feugiat elit nunc, vitae auctor risus malesuada sit amet. Curabitur vel tempus enim, non ultrices dolor. Sed odio sem, tristique ac orci porta, dignissim aliquet ipsum. Aenean mattis faucibus libero, eu euismod turpis fermentum id.`,
    `Donec tempor commodo dictum. Integer eget auctor lorem, sit amet faucibus quam. Vivamus ultrices sem nec semper imperdiet. Fusce hendrerit gravida lacinia. Sed eu pretium turpis. Pellentesque facilisis enim a aliquet condimentum. Curabitur sit amet ex sed odio cursus gravida in facilisis augue. Etiam nisi velit, aliquet sed consectetur a, sollicitudin quis purus. Donec quis nisi a quam bibendum rutrum. Integer dictum tempus erat, quis pretium orci iaculis nec. Curabitur vulputate, est vulputate fermentum dictum, tortor arcu pulvinar nibh, vel eleifend leo libero eu nulla. Pellentesque maximus velit augue, nec cursus nibh accumsan id. Vestibulum auctor elit non placerat faucibus. Proin mollis accumsan efficitur.`,
    `Etiam vulputate eleifend mi. Nunc iaculis luctus blandit. Phasellus imperdiet erat ac nibh finibus egestas. Pellentesque at ex laoreet, luctus nisi quis, tincidunt dolor. Nam eu lacus id sem vehicula volutpat. Praesent rhoncus tortor a dolor sodales ultrices. Sed ullamcorper, nibh eget lacinia fermentum, tortor turpis viverra nibh, pharetra suscipit elit ex sed eros. Curabitur orci eros, fringilla et rutrum et, consectetur consectetur arcu. Suspendisse eget euismod dui. Donec sit amet velit in lacus volutpat interdum. Fusce ligula ex, commodo non erat ut, lacinia convallis nisl. Nunc nec velit quis orci ullamcorper tincidunt non quis odio.`,
    `Phasellus eget ante leo. Integer eget odio arcu. Nulla facilisi. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce pellentesque tellus nec ex ornare, in pretium magna interdum. Vivamus non euismod arcu, eu cursus felis. Cras in lacus vel eros volutpat faucibus vel a tortor. Sed non dui non velit accumsan tempor. Pellentesque quis justo vitae ligula ultrices semper sed ac nibh.`,
    `Donec mattis tortor dui, sit amet luctus justo mattis vitae. Curabitur venenatis felis nibh, ut lacinia velit consectetur eu. Nunc vel elit fringilla, eleifend purus quis, mollis velit. Vestibulum cursus scelerisque tellus eget commodo. Vestibulum convallis posuere ex in finibus. Nullam arcu felis, dapibus id dictum non, placerat in massa. Cras in bibendum turpis. Vestibulum at auctor tortor.`,
    `In tortor turpis, tempus non sem et, porta euismod erat. Maecenas nisi odio, aliquet ac ligula hendrerit, faucibus semper felis. Aliquam auctor porttitor ultricies. Quisque ultrices elit a consectetur sagittis. Nulla commodo, leo id elementum gravida, risus mauris tempus quam, in lobortis felis urna nec velit. Cras porttitor risus nisi, et fermentum ante faucibus quis. Vestibulum dignissim in risus semper interdum. Ut ut augue ante. Aliquam elementum, risus sit amet vehicula maximus, ex turpis hendrerit ex, sit amet maximus nunc nulla nec turpis. Curabitur dui arcu, eleifend vel sem eget, scelerisque lobortis lacus.`,
    `Nunc varius et nisi sed feugiat. Nulla luctus a turpis id posuere. Sed vel mollis eros. Aenean tempor leo quis erat efficitur consectetur. Phasellus sed massa eget dolor tincidunt interdum. Vivamus blandit laoreet sapien vel auctor. Nunc congue tincidunt massa vitae dignissim. Aenean lacus nulla, dignissim vel pharetra vitae, finibus sit amet sem. Suspendisse mi sem, volutpat consequat magna a, fermentum laoreet odio. Nulla interdum semper mauris, eu rutrum felis molestie in. Vestibulum ante ipsum primis in faucibus orci luctus et ultrices posuere cubilia curae; Sed at cursus tellus.`,
    `Aliquam erat volutpat. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Donec id hendrerit sapien. Pellentesque nec viverra nunc, quis sodales erat. Nam malesuada metus sed est suscipit facilisis. Quisque dolor enim, scelerisque a condimentum eget, lobortis id dolor. Proin sodales maximus turpis, ut cursus massa molestie in. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin volutpat consectetur venenatis.`,
    `Fusce nisi nisl, tempus quis nunc non, molestie viverra felis. Vivamus lacinia metus posuere, pharetra ligula ut, blandit turpis. Nullam id pellentesque nunc, et accumsan metus. Donec semper pharetra euismod. Praesent nec gravida metus. Sed sed accumsan magna. Sed venenatis luctus nisi, eget maximus sapien imperdiet eget. Integer in leo nulla. Proin commodo pulvinar enim, id porta ligula sagittis eget. Sed tincidunt, purus pretium aliquet cursus, eros odio posuere dui, lobortis auctor orci felis et ipsum. In fermentum ultrices odio, tristique tempus erat eleifend sit amet. Quisque elit ipsum, cursus nec diam at, pellentesque fermentum nisi. Integer lacinia eros sem, nec tincidunt odio egestas non.`,
    `Sed feugiat convallis neque ac rhoncus. Proin ornare, nisi ut pretium mollis, nulla risus malesuada leo, a accumsan lorem dui vitae tortor. Proin ac consectetur ligula, in consequat risus. Mauris lectus lacus, sagittis sit amet quam molestie, feugiat ultricies felis. Fusce quis convallis mauris, et gravida odio. Aenean in dolor sit amet libero consectetur pulvinar. Donec ullamcorper ipsum non vehicula pulvinar. Sed sollicitudin est at dapibus vehicula.`,
    `Pellentesque nisl diam, ultrices fermentum interdum ut, consectetur in erat. Etiam non quam justo. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nullam bibendum interdum congue. Proin sit amet sodales quam. Sed ultricies tincidunt metus ac pharetra. Quisque odio nunc, aliquam in accumsan at, mollis ac quam. Morbi venenatis ligula nunc, nec mollis leo iaculis id. Nam ac magna non purus consequat interdum. In hac habitasse platea dictumst.`,
    `Integer rhoncus eu ex id tincidunt. Nunc vel purus auctor, pretium velit non, lobortis odio. Fusce feugiat, lorem sit amet tincidunt commodo, nibh mi fringilla eros, id pharetra velit sem vel est. Proin in iaculis felis. Pellentesque commodo non turpis sit amet cursus. Duis hendrerit, lacus vitae euismod cursus, enim massa facilisis eros, sed dictum eros sem ut diam. Mauris iaculis eros non ante pellentesque tempor.`,
    `Nunc maximus massa non gravida finibus. Etiam a hendrerit quam, ut posuere ex. Nam ac tortor euismod, porttitor ante at, euismod enim. Nunc at feugiat massa. Nam felis sapien, vestibulum sit amet malesuada sit amet, finibus sed felis. Donec eleifend vel risus in dignissim. In a commodo tortor. Maecenas non leo a elit eleifend scelerisque eu ac eros. Vestibulum ac gravida magna, vitae pellentesque tortor. Vivamus vel sollicitudin magna. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
    `Praesent rhoncus sagittis orci, at ultrices metus vehicula ac. Maecenas eget lectus non enim bibendum dapibus. Duis sit amet tempor nulla, non ullamcorper risus. Donec molestie, odio non efficitur lacinia, dui quam rhoncus metus, eget tristique purus dui vitae ante. In hac habitasse platea dictumst. Mauris eu quam vitae dolor auctor condimentum. Vivamus venenatis scelerisque lorem sed ullamcorper. Curabitur sollicitudin erat euismod nibh lacinia, eget malesuada dui feugiat. Aliquam porttitor, nibh nec pharetra lobortis, neque erat pulvinar lacus, non suscipit ligula risus quis massa. Etiam hendrerit urna ex, eget aliquam tortor commodo sed. Nulla et placerat velit. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Phasellus convallis, quam nec suscipit facilisis, justo tortor maximus augue, sed vestibulum dui nunc sed arcu. Pellentesque eget ligula sit amet magna sagittis sodales. Proin feugiat efficitur ipsum congue eleifend. Aenean pharetra, sem vel consequat lobortis, risus tortor ultricies nunc, vel iaculis lacus leo tempus dui.`,
    `In semper finibus molestie. Maecenas sit amet erat in massa efficitur sodales sit amet vel ante. Donec convallis nisl diam, a pulvinar erat gravida vitae. Nunc tincidunt lectus ligula, nec ornare lectus vestibulum eu. Pellentesque mauris mi, porttitor id condimentum ac, dignissim at nisl. Suspendisse rhoncus vehicula convallis. Pellentesque pharetra, sapien sit amet laoreet gravida, eros erat ultrices turpis, maximus viverra neque tortor euismod felis. Mauris vehicula nulla non lectus lacinia placerat. Sed eu finibus eros. Sed arcu mi, dignissim sed leo sit amet, semper laoreet massa. Pellentesque feugiat imperdiet lorem suscipit faucibus. Mauris non velit quis orci condimentum mollis. Donec at orci at nisl sagittis sodales.`,
    `Donec eget augue vitae turpis efficitur mollis auctor et leo. Nunc sem lectus, accumsan in viverra convallis, suscipit eu sem. Praesent rhoncus quam nisi, lobortis lacinia odio imperdiet fringilla. Praesent a maximus erat, a volutpat nunc. Nulla vulputate vehicula porttitor. Donec ornare tortor eget diam ullamcorper molestie. Orci varius natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Sed cursus placerat neque, vitae fermentum orci pulvinar in. Donec nec neque vitae sapien congue scelerisque quis eget tellus. Phasellus elementum, enim vel eleifend interdum, enim massa porttitor magna, vitae lacinia diam mauris ut mi. Duis vitae blandit diam. Aliquam quis tempus magna, et dignissim nunc.`,
    `Duis dictum aliquet eleifend. Maecenas nisi velit, ultricies sed diam et, malesuada placerat metus. Proin vestibulum sem ac arcu viverra faucibus. Aenean convallis at purus nec congue. Phasellus ullamcorper fringilla mauris pharetra suscipit. Nunc et accumsan ipsum. Integer ultrices erat eget urna vulputate, id gravida ex hendrerit. Duis tristique massa ut ex tincidunt, vel hendrerit sapien consectetur.`,
    `Aliquam erat volutpat. Vestibulum eget tortor eu ex cursus viverra sed vitae mi. Aliquam ultrices erat a eros mollis accumsan. Cras eget quam eros. Duis non sodales libero. Cras lobortis augue ante, et elementum dolor consectetur quis. Sed tristique ullamcorper massa, in aliquam diam gravida at. Donec sollicitudin vitae nisi vitae pretium. Mauris sit amet iaculis augue, in fringilla lorem.`,
    `Nam in hendrerit sapien. Quisque ut purus sit amet odio egestas sodales ac porttitor mi. In ex erat, efficitur et bibendum at, posuere ac lorem. In mattis, nunc at aliquam porta, libero mauris euismod nulla, quis faucibus nisi purus eleifend nulla. Mauris dui lacus, venenatis sit amet congue ut, dictum vitae quam. Vestibulum lobortis orci sed aliquet iaculis. Duis eu velit in diam mattis hendrerit eu eget augue.`,
    `Maecenas imperdiet ligula ligula, at laoreet dui maximus in. Nunc ultrices rutrum cursus. Etiam eleifend cursus ligula sed scelerisque. In vel sodales nulla. Suspendisse mattis commodo lacus, non venenatis arcu congue nec. Mauris quis odio non magna laoreet elementum. Sed at ligula vehicula, ullamcorper nisi quis, dapibus libero. Nam ut dolor lectus. Suspendisse bibendum ipsum et lobortis ornare. Fusce convallis augue non dignissim tincidunt. Sed dapibus pharetra viverra. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus, diam eu iaculis volutpat, mi libero scelerisque orci, a lobortis ligula est quis orci.`,
    `Aliquam lobortis est nec mauris posuere placerat. Vestibulum fringilla tellus purus, varius efficitur dui iaculis nec. Suspendisse urna velit, luctus at lorem eget, rutrum dapibus sem. Nullam pulvinar, magna eu malesuada fermentum, dolor sapien commodo nisl, nec dignissim purus metus eu nibh. Nulla facilisi. Morbi condimentum quis quam non finibus. Vestibulum eget venenatis enim. Aliquam velit lacus, faucibus in accumsan et, iaculis vel leo. Quisque tincidunt dolor vel cursus dapibus. Nam pretium, enim vel laoreet facilisis, diam metus semper arcu, id faucibus massa dui a risus. Morbi risus ante, condimentum a pretium eu, cursus at metus. Nunc a facilisis leo. Fusce ac dictum nisi.`,
  ];

  return paragraphs;
}

/* Private helpers }
 ****************************************************************************/

module.exports = {
  StudyBook,
};

/**
 * Superscript (using an OpenType font that supports super/sub-scripts)
 *  doc.text('Some text', {continued: true});
 *  doc.text('a', {features: ['sups'], continued: true});
 *  doc.text(', some more text.', {features: []});
 *
 * Using multiple columns:
 *  const lorem = 'Lorem ipsum dolor sit amet, ...'
 *  doc.text(lorem, { columns   : 3,
 *                    columnGap : 15,
 *                    height    : 100,
 *                    width     : 465,
 *                    align     : 'justify',
 *                  } );
 *
 * Landscape the entire document (disable 'autoFirstPage'):
 *  const doc = new PDFDocument({ autoFirstPage: false });
 *  doc.addPage(  { size  : 'LEGAL',
 *                  layout: 'landscape',
 *                } );
 *
 * Built-in fonts:
 *  - Courier
 *  - Courier-Bold
 *  - Courier-Oblique
 *  - Courier-BoldOblique
 *  - Helvetica
 *  - Helvetica-Bold
 *  - Helvetica-Oblique
 *  - Helvetica-BoldOblique
 *  - Symbol
 *  - Times-Roman
 *  - Times-Bold
 *  - Times-Italic
 *  - Times-BoldItalic
 *  - ZapfDingbats
 *
 * OpenType fonts:
 *  Noto Sans CJK JP    /usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc
 *
 * https://www.reddit.com/r/typography/comments/ci4nwk/otf_vs_ttf/
 *  In the modern era of font development, OTF and TTF are very, very similar.
 *  - OTF stands for Postscript-flavored OpenType.
 *  - TTF stands for Truetype-flavored Opentype.
 *
 * Measurements are in Points where 72 points == 1"
 */
