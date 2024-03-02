/**
 *  Set the given CSS variable to the provided value within the DOM.
 *
 *  @method set_cssVariable
 *  @param  name    The name of the variable (e.g. '--test') {String};
 *  @param  val     The new value for the variable {String};
 *
 *  @return void
 */
export function set_cssVariable( name, val ) {
  if (typeof(document) !== 'undefined') {
    document.documentElement.style.setProperty( name, val );
  }
}
