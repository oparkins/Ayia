/**
 *  An simple, client-side message bus along the lines of postal.js
 *
 */

// Only include on the client side {
export const csr = true;
export const ssr = false;
// Only include on the client side }

/**
 *  A single topic channel
 *  @class  Channel
 */
export class Channel {

  /**
   *  Create a new channel definition
   *  @constructor
   *  @param [name = DEFAULT_CHANNEL] The name of the channel {String};
   *  @param bus                      The controlling Bus {Bus};
   */
  constructor( name, bus ) {
    this.bus   = bus;
    this.name  = name || bus.config.DEFAULT_CHANNEL;
    this.topics = new Map();
  }

  /**
   *  Subscribe to a topic
   *  @method subscribe
   *  @param  envelope    The topic or envelope {String | Object};
   *  @param  [callback]  If `envelope` is a string, the callback {Function};
   *
   *  If `envelope` is provided as an object, it is expected to have the form:
   *    { topic   : {String},
   *      callback: {Function},
   *    }
   *
   *  @return A new subsription {Subscription};
   */
  subscribe( envelope, callback=null ) {
    const envIsObject     = (envelope != null &&
                             typeof(envelope) === 'object');
    const topicName       = (envIsObject ? envelope.topic : envelope);
    const topicIsString   = (typeof(topicName) === 'string');
    let   callbackIsFunc  = (typeof(callback) === 'function');

    if ( ! callbackIsFunc && envIsObject ) {
      callback     = envelope.callback;
      callbackIsFunc = (typeof(callback) === 'function');
    }

    if ( ! topicIsString ) {
      throw new Error('Channel.subscribe(): '
                      + 'requires a topic string as either the first argument '
                      + 'or a property of the first argument');
    }

    if ( ! callbackIsFunc ) {
      throw new Error('Channel.subscribe(): '
                      + 'requires a callback as either the second argument or '
                      + 'a property of the first argument');
    }

    let topic = this.topics.get( topicName );
    if ( topic == null ) {
      // Create a new topic
      topic = new Set();

      this.topics.set( topicName, topic );
    }

    const subscription  = new Subscription( this, topicName, callback );
    topic.add( subscription );

    return subscription;
  }

  /**
   *  Unsubscribe the given subscriber.
   *  @method unsubscribe
   *  @param  sub   The target subscription {Subscription};
   *
   *  @return void
   */
  unsubscribe( sub ) {
    const subIsSubscription = (sub instanceof Subscription);

    if ( ! subIsSubscription ) {
      throw new Error(`Channel[ ${this.name} ].unsubsribe(): `
                      + 'The first argument should be a Subscription');
    }

    const topic = this.topics.get( sub.topic );
    if ( topic == null ) {
      throw new Error(`Channel[ ${this.name} ].unsubsribe(): `
                      +   `no such topic[ ${sub.topic} ]`);
      console.error('Channel[ %s ].unsubscribe(): no such topic [ %s ]',
                    this.name, sub.topic);
      return;
    }

    topic.delete( sub );
  }

  /**
   *  Publish to a topic
   *  @method publish
   *  @param  topic       The topic {String | Object};
   *  @param  [data]      If `topic` is a string, the data to send {Object};
   *  @param  [callback]  The callback {Function};
   *
   *  If `topic` is provided as an object, it is expected to have the form:
   *    { topic : {String},
   *      data  : {Mixed},
   *    }
   *
   *  If `callback` is provided, it will be invoked once all subscribers have
   *  been processed with the value of:
   *    { activated : {Number}, // number of active subscribers invoked
   *      skipped   : {Number}, // number of inactive subscribers skipped
   *    }
   *
   *  @return void
   */
  publish( topic, data=null, callback=null ) {
    let   topicIsString   = (typeof(topic) === 'string');
    const topicIsObject   = (topic != null && typeof(topic) === 'object');
    const dataIsFunc      = (typeof(data) === 'function');
    let   callbackIsFunc  = (typeof(callback) === 'function');
    const envelope        = {
      channel : this.name,
      topic   : topic,
      data    : (!dataIsFunc ? data : null),
    };

    if ( topicIsObject ) {
      Object.assign( envelope, topic );

      topicIsString = (typeof(envelope.topic) === 'string');

    }

    if (! topicIsString) {
      throw new Error(`Channel[ ${this.name} ].publish(): The first argument `
                      + 'should be either an envelope object '
                      + 'or a string topic');
    }

    if (dataIsFunc) {
      callback       = data;
      callbackIsFunc = true;
    }

    topic = this.topics.get( envelope.topic );
    if ( topic == null ) {
      /* :TODO: Create a new topic
      throw new Error(`Channel[ ${this.name} ].publish(): `
                      +   `Unknown topic [ ${envelope.topic} ]`);

      console.warn('Channel[ %s ].publish(): Unknown topic [ %s ]',
                    this.name, envelope.topic);
      // */

      return;
    }

    envelope.channel = this.name;

    let activated = 0;
    let skipped   = 0;
    topic.forEach( sub => {
      if ( sub.invoke( data, envelope ) ) {
        activated++;

      } else {
        skipped++;
      }
    });

    if ( callbackIsFunc ) {
      callback( { activated, skipped } );
    }
  }
}

/**
 *  A channel subscription
 *  @class  Subscription
 */
export class Subscription {

  /**
   *  Create a new instance
   *  @constructor
   *  @param  channel   The target channel {Channel};
   *  @param  topic     The target topic {String};
   *  @param  callback  The callback to invoke when new messages are published
   *                    on this channel/topic {Function};
   */
  constructor( channel, topic, callback ) {
    const isChannel       = (channel instanceof Channel);
    const topicIsString   = (typeof(topic)    === 'string');
    const callbackIsFunc  = (typeof(callback) === 'function');

    if ( ! isChannel ) {
      throw new Error('The first argument to Subscription should '
                      + 'be a channel instance');
    }
    if ( ! topicIsString || topic.length < 1 ) {
      throw new Error('The second argument to Subscription should '
                      + 'be a non-empty topic string');
    }
    if ( !callbackIsFunc ) {
      throw new Error('The third argument to Subscription should '
                      + 'be a callback function');
    }

    this.channel  = channel;
    this.topic    = topic;
    this.callback = callback;
    this.isActive = true;
    this._context = this;
  }

  /**
   *  Invoke this subscriber with the given data and envelope
   *  @method invoke
   *  @param  data      The message data {Object};
   *  @param  envelope  The message envelope {Object};
   *
   *  @return An indication of whether the subscriber was invoked {Boolean};
   */
  invoke( data, envelope ) {
    if ( ! this.isActive ) { return false }

    // Detach from the main thread using a promis
    const promise = new Promise( (resolve, reject) => {
      try {
        /*
        console.log('Subscription[ %s.%s ].invoke(): envelope:',
                    this.channel.name, this.topic, envelope);
        // */

        this.callback.call( this._context, data, envelope );

      } catch(err) {
        let str = '';
        try { str = JSON.stringify(envelope) } catch(err) {}

        console.error('Subscription[ %s.%s ].invoke( %s ), FAILED:',
                      this.channel.name, this.topic,
                      str, err);

        return reject( err );
      }

      return resolve( true );
    });

    return true;
  }

  /**
   *  Unsubscribe from this channel.
   *  @method unsubscribe
   *
   *  @return void
   */
  unsubscribe() {
    if ( ! this.isActive ) { return }

    this.isActive = false;

    this.channel.unsubscribe( this );
  }
}

/**
 *  The message bus (singleton)
 */
export const Bus  = {
  Channel       : Channel,
  Subscription  : Subscription,

  /**
   *  Configuration
   *  @prop config  {Object};
   */
  config  : {
    DEFAULT_CHANNEL : '/',
  },

  /**
   *  The set of active channels.
   *  @prop channels {Map};
   */
  channels : new Map(),

  /**
   *  Create a new channel
   *  @method channel
   *  @param  name    The channel name {String};
   *
   *  @return A new channel {Channel};
   */
  channel( name ) {
    const nameIsString  = (typeof(name) === 'string');

    if ( ! nameIsString ) {
      throw new Error('Bus.channel(): requires a string name');
    }

    let channel = this.channels.get( name );
    if ( channel == null ) {
      channel = new Channel( name, this );

      this.channels.set( name, channel );
    }

    return channel;
  }
};

export default Bus;
