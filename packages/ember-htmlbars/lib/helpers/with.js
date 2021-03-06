/**
@module ember
@submodule ember-htmlbars
*/

import Ember from "ember-metal/core"; // Ember.assert

import { create as o_create } from "ember-metal/platform";
import isNone from 'ember-metal/is_none';
import { bind } from "ember-htmlbars/helpers/binding";
import WithView from "ember-views/views/with_view";

/**
  Use the `{{with}}` helper when you want to aliases the to a new name. It's helpful
  for semantic clarity and to retain default scope or to reference from another
  `{{with}}` block.

  ```handlebars
  // posts might not be
  {{#with user.posts as blogPosts}}
    <div class="notice">
      There are {{blogPosts.length}} blog posts written by {{user.name}}.
    </div>

    {{#each post in blogPosts}}
      <li>{{post.title}}</li>
    {{/each}}
  {{/with}}
  ```

  Without the `as` operator, it would be impossible to reference `user.name` in the example above.

  NOTE: The alias should not reuse a name from the bound property path.
  For example: `{{#with foo.bar as foo}}` is not supported because it attempts to alias using
  the first part of the property path, `foo`. Instead, use `{{#with foo.bar as baz}}`.

  ### `controller` option

  Adding `controller='something'` instructs the `{{with}}` helper to create and use an instance of
  the specified controller wrapping the aliased keyword.

  This is very similar to using an `itemController` option with the `{{each}}` helper.

  ```handlebars
  {{#with users.posts as posts controller='userBlogPosts'}}
    {{!- `posts` is wrapped in our controller instance }}
  {{/with}}
  ```

  In the above example, the `posts` keyword is now wrapped in the `userBlogPost` controller,
  which provides an elegant way to decorate the context with custom
  functions/properties.

  @method with
  @for Ember.Handlebars.helpers
  @param {Function} context
  @param {Hash} options
  @return {String} HTML string
*/
export function withHelper(params, hash, options, env) {

  Ember.assert(
    '{{#with foo}} must be called with a single argument or the use the '+
    '{{#with foo as bar}} syntax',
    params.length === 1
  );

  Ember.assert("The {{#with}} helper must be called with a block", !!options.render);

  var source, keyword;
  var preserveContext, context;
  if (options.types[0] === 'id') {
    Ember.deprecate('Using the context switching form of `{{with}}` is deprecated. Please use the keyword form (`{{with foo as bar}}`) instead. See http://emberjs.com/guides/deprecations/#toc_more-consistent-handlebars-scope for more details.');

    source = params[0];
    preserveContext = false;
    context = source.value();
  } else if (options.types[0] === 'keyword') {
    source = params[0].stream;
    keyword = params[0].to;
    context = this.get('context');

    var localizedOptions = o_create(options);

    localizedOptions.keywords = {};
    localizedOptions.keywords[keyword] = source;
    hash.keywordName = keyword;

    options = localizedOptions;
    preserveContext = true;
  }

  bind.call(this, source, hash, options, env, preserveContext, exists, undefined, undefined, WithView);
}

withHelper._preprocessArguments = function(view, params, hash, options, env) {
  if (params.length === 3 && params[1] === "as") {
    params.splice(0, 3, {
      from: params[0],
      to: params[2],
      stream: view.getStream(params[0])
    });

    options.types.splice(0, 3, 'keyword');
  }
};

function exists(value) {
  return !isNone(value);
}
