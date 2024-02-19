/**
 *  Available stores:
 *    theme         {String};
 *    drawer_closed {Boolean};
 *    user          {Object};
 *    errors        {Object}  -- arrays keyed by type (e.g. auth_password);
 */

// Only include on the client side {
export const csr = true;
export const ssr = false;
// Only include on the client side }

import { writable } from "svelte/store";

// Browser-side LocalStorage access
const localStorage  = (typeof(window) !== 'undefined'
                          ? window.localStorage
                          : null);

/****************************************************************************
 * theme {
 *
 */
export const  theme = writable( 'dark' );

if (localStorage) {
  const storedVal = localStorage.getItem("theme");

  if (storedVal) {
    theme.set( storedVal );
  }

  // Keep localStorage in-sync
  theme.subscribe(value => {
    /*
    console.log('store.theme.updated:', value);
    // */

    localStorage.setItem("theme", value === 'dark' ? 'dark' : 'light');
  });
}

/* theme }
/****************************************************************************
 * drawer_closed {
 *
 */
export const  drawer_closed = writable( false );

if (localStorage) {
  const storedVal = ( localStorage.getItem("drawer_closed") === 'true' );

  if ( storedVal === true ) {
    drawer_closed.set( storedVal );
  }

  // Keep localStorage in-sync
  drawer_closed.subscribe(value => {
    /*
    console.log('store.drawer_closed.updated:', value);
    // */

    localStorage.setItem("drawer_closed", (value ? 'true' : 'false'));
  });

}

/* drawer_closed }
 ****************************************************************************
 * user {
 *
 */
export const  user  = writable( null );

if (localStorage) {
  const storedVal  = (localStorage.user
                        ? JSON.parse(localStorage.getItem("user"))
                        : null);

  user.set( storedVal );

  // Keep localStorage in-sync
  user.subscribe(value => {
    /*
    console.log('store.user.updated:', value);
    // */

    localStorage.setItem("user", (value ? JSON.stringify(value) : null));
  });
}

/* user }
 ****************************************************************************
 * errors {
 *
 */
export const  errors  = writable( [] );

/* errors }
 ****************************************************************************/
