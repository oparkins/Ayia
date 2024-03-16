import { Popover } from 'flowbite';

/**
 *  Return the HTML representing a VerseNote that will be programatically
 *  activated within the Chapter component using the Flowbite Popover
 *  component.
 *
 *  @method html
 *  @param  id      The id of the note {String};
 *  @param  type    The note type (xref | foot) {String};
 *  @param  label   The note label {String};
 *  @param  content The HTML to render within the note body {String};
 *
 *  The returned HTML will include an:
 *    - icon trigger with an:
 *      - 'id'                    of `${id}-trigger`
 *      - 'data-popover-target'   of `${id}-target`
 *    - note content with an:
 *      - 'id'                    of `${id}-target`
 *      - 'data-popover'          attribute set
 *
 *  @return The HTML {String};
 */
export function html( id, type, label, content ) {
  type  = _validate_type( type );
  id    = _validate_id( id, type );

  const html  = [
    `<div class='inline note ${type}'>`,
      `<sup>`,
        _icon_html( id, type, label ),
      `</sup>`,
      `<div data-popover `
			+			`id='${id}-target' `
			+			`role='tooltip' `
			+			`class='invisible opacity-0 note-content'>`,
      /*
      `<div data-popover id='${id}' role='tooltip' `
      +     `class='absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800'>`,
      // */
        `<div class='px-3 py-2'>`,
          content,
        `</div>`,
        `<div data-popper-arrow></div>`,
      `</div>`,
    `</div>`,
  ];

  return html.join('');
}

/**
 *  Activate all dynamically rendered VerseNote items within the given DOM
 *  element.
 *
 *  @method activate
 *  @param  parent    The container in which target VerseNote elements should
 *                    be activated {DOMElement};
 *
 *  Targets will be identified via the trigger, which will have attributes:
 *    - 'id'                    of `${id}-trigger`
 *    - 'data-popover-target'   of `${id}-target`
 *
 *  @return The set of activated popover instances {Array};
 */
export function activate( parent ) {
  const popovers  = [];
  const $triggers = parent.querySelectorAll('[data-popover-target]');

  console.log('verse_note.activate(): %d triggers ...',
              $triggers.length);

  $triggers.forEach( $trigger => {
    const id        = $trigger.getAttribute( 'id' );
    const target_id = $trigger.getAttribute( 'data-popover-target' );
    if (target_id == null) {
      console.error('verse_note.activate(): trigger[ %s ], missing attr[ %s ]',
                    id, 'data-popover-target');
      return;
    }

    const $target   = parent.querySelectorAll( `#${target_id}` );
    if ($target == null) {
      console.error('verse_note.activate(): trigger[ %s ], cannot find '
                    +     'identified target[ %s ]',
                    id, target_id);
      return;
    }

    const popover = _activate_one( $trigger, $target[0] );
  });

  return popovers;
}

/****************************************************************************
 * Private methods {
 *
 */

/**
 *  Activate a single, dynamically rendered VerseNote based upon Flowbit
 *  Popover.
 *
 *  @method _activate_one
 *  @param  $trigger  The trigger element {DOMElement};
 *  @param  $target   The target  element {DOMElement};
 *
 *  @return The Popover instance {Popover};
 *  @private
 */
export function _activate_one( $trigger, $target ) {
  const id        = $trigger.getAttribute( 'id' );
  const target_id = $trigger.getAttribute( 'data-popover-target' );

  // options with default values
  const options = {
    //placement   : 'bottom',

    triggerType : 'hover',
    offset      : 10,

    onHide: () => {
      console.log('popover %s: shown', id);
    },
    onShow: () => {
      console.log('popover %s: hidden', id);
    },
    onToggle: () => {
      console.log('popover %s: toggled', id);
    },
  };

  // instance options object
  const instanceOptions = {
    id      : target_id,
    override: true
  };

  return new Popover($target, $trigger, options, instanceOptions);
}

/**
 *  Retrieve the HTML for the icon related to `type`
 *
 *  @method _icon_html
 *  @param  id      The id of the note {String};
 *  @param  label   The note label {String};
 *  @param  type    The note type (xref | foot) {String};
 *
 *  The returned HTML will include an:
 *    - 'id'                    of `${id}-trigger`
 *    - 'data-popover-target'   of `${id}-target`
 *
 *  @return The HTML for the icon {String};
 *  @private
 */
function _icon_html( id, type, label ) {
  let path;

  if (type === 'xref') {
    // LinkOutline
    path = `<path stroke='currentColor' `
         +       `stroke-linecap='round' `
         +       `stroke-linejoin='round' `
         +       `stroke-width='2' `
         +       `d='M13.2 9.8a3.4 3.4 0 0 0-4.8 0L5 13.2A3.4 3.4 0 0 0 9.8 18l.3-.3m-.3-4.5a3.4 3.4 0 0 0 4.8 0L18 9.8A3.4 3.4 0 0 0 13.2 5l-1 1' />`;

  } else {
    // MessageCaptionSolid
    path = `<path fill-rule='evenodd' `
         +       `clip-rule='evenodd' `
         +       `d='M3 6c0-1.1.9-2 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-6.6l-2.9 2.6c-1 .9-2.5.2-2.5-1.1V17H5a2 2 0 0 1-2-2V6Zm4 2a1 1 0 0 0 0 2h5a1 1 0 1 0 0-2H7Zm8 0a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2h-2Zm-8 3a1 1 0 1 0 0 2h2a1 1 0 1 0 0-2H7Zm5 0a1 1 0 1 0 0 2h5a1 1 0 1 0 0-2h-5Z' />`
  }

  return `<svg xmlns='http://www.w3.org/2000/svg' `
         +      `id='${id}-trigger'`
         +      `title='${label}' `
         +      `data-popover-target='${id}-target' `
         +      `class='note-label' `
         +      `aria-label='link outline' `
         +      `role='img' `
         +      `viewBox='0 0 24 24' `
         +      `fill='none' `
         +      `tabindex='0'>`
         +    path
         + `</svg>`;
}

/**
 *  Return a validated note type
 *
 *  @method _validate_type
 *  @param  type    The note type (xref | foot) {String};
 *
 *  @return A validated type {String};
 *  @private
 */
function _validate_type( type ) {
  if (type !== 'xref' && type !== 'foot') { type = 'foot' }
  return type;
}

/**
 *  Return a validated id
 *
 *  @method _validate_id
 *  @param  id      The target id {String};
 *  @param  type    The note type (xref | foot) {String};
 *
 *  @return A validated id {String};
 *  @private
 */
function _validate_id( id, type ) {
  /* :XXX: A DOM id CANNOT start with a number.
   *       To avoid issues with books like '1 Corinthians' (1CO),
   *       prefix ALL id values with the type.
   */
  const DOM_id  = id.replaceAll('.','-');

  return `${type}-${DOM_id}`;
}

/*
<button
    data-popover-target="popover-hover"
    data-popover-trigger="hover"
    type="button"
    class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-3 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
  Hover popover
</button>

<div data-popover
     id="popover-hover"
     role="tooltip"
     class="absolute z-10 invisible inline-block w-64 text-sm text-gray-500 transition-opacity duration-300 bg-white border border-gray-200 rounded-lg shadow-sm opacity-0 dark:text-gray-400 dark:border-gray-600 dark:bg-gray-800">
  <div class="px-3 py-2 bg-gray-100 border-b border-gray-200 rounded-t-lg dark:border-gray-600 dark:bg-gray-700">
    <h3 class="font-semibold text-gray-900 dark:text-white">Popover hover</h3>
  </div>
  <div class="px-3 py-2">
    <p>And here's some amazing content. It's very engaging. Right?</p>
  </div>
  <div data-popper-arrow></div>
</div>
// */

/* Private methods }
 ****************************************************************************/
