/**
 *  Available stores:
 *    theme         {String};
 *    user          {Object};
 *    errors        {Object}  -- arrays keyed by type (e.g. auth_password);
 *
 *    drawer_open   {Boolean};
 */

// Only include on the client side {
export const csr = true;
export const ssr = false;
// Only include on the client side }

import { writable } from 'svelte/store';
import Agent        from '$lib/agent';

// Create shared stores
export const  theme           = _writable_ls( 'color-theme', 'dark' );
export const  user            = _writable_ls( 'user', null,
                                              (val) => JSON.stringify(val),
                                              (str) => JSON.parse(str) );
export const  errors          = writable( [] );
export const  versions        = writable( null );
export const  verse           = writable( null );
export const  primary_version = writable( null );

/*
export const  drawer_open = _writable_ls( 'drawer_open', false,
                                          (val) => (val ? 'true' : 'false'),
                                          (str) => (str === 'true') );
// */

Agent.get('versions')
  .then( res => {
    console.log('%s versions:', res.total);
    versions.set( res );

    if (Array.isArray( res.versions )) {
      // Initialize 'primary_version' to the first
      primary_version.set( res.versions[0] );
    }
  })
  .catch( err => {
    console.error('Cannot get versions:', err);
  });

/****************************************************************************
 * Private methods {
 *
 */

/**
 *  Create a new writable store that, if localStorage is available, is linked
 *  to localStorage.
 *
 *  @method _writable_ls
 *  @param  key                 The store key {String};
 *  @param  def_val             The default value {Mixed};
 *  @param  [serialize=null]    A serialize method {Function};
 *                                  serialize( storeValue ) => String;
 *  @param  [deserialize=null]  A deserialize method {Function};
 *                                  deserialize( String ) => storeValue;
 *
 *  @return A new writable store {Writable};
 *  @private
 */
function _writable_ls( key, def_val, serialize=null, deserialize=null ) {
  // Default serialize/deserialize to no-ops
  if (serialize   == null) { serialize   = (val) => val }
  if (deserialize == null) { deserialize = (val) => val }

  // Browser-side LocalStorage access
  const localStorage  = (typeof(window) !== 'undefined'
                            ? window.localStorage
                            : null);
  const get_ls        = (localStorage
                          ? () => deserialize( localStorage.getItem( key ) )
                          : () => def_val);

  const  key_init  = get_ls();
  const  key_store = writable( key_init );

  if (localStorage) {
    const put_ls  = (val) => localStorage.setItem( key, serialize( val ) );

    // Keep localStorage in-sync
    key_store.subscribe(value => {
      /*
      console.log('>>> store.%s: changed:', key, value);
      // */

      put_ls( value );
    });

    // Keep store in-sync with external localStorage changes
    window.addEventListener('storage', (event) => {
      /*
      console.log('>>> localStorage.%s: %s changed:',
                  key, event.key, event.newValue);
      // */

      if (event.key == null) {
        // The ensure store is being cleared
        put_ls( def_val );
        return;
      }

      if (event.key === key) {
        //key_store.set( get_ls() );
        key_store.set( deserialize( event.newValue ) );
      }
    });
  }

  return key_store;
}

/* Private methods }
 ****************************************************************************/
