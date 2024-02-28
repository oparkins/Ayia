/**
 *  Render a verse from an 'interlinear' version.
 *
 *  @method il_render_verse
 *  @param  key           The key for this verse {String};
 *  @param  verse         The verse entry {Object}
 *  @param  verse.markup  yvers-specific markup {Array};
 *  @param  verse.text    Raw text of this verse {String};
 *
 *  @return The rendered HTML {String};
 */
export function il_render_verse( key, verse ) {
  return `
    <div>
      ${key}: ${verse.text}
    </div>
  `;
}
