Not Using Autodoc
=================

Originally the idea was to use Sphinx autodoc to document both the golang and
javascript source code for this project. This failed because of a few reasons:

#. Sphinx dropped support for other languages

    According to `this issue <https://github.com/readthedocs/sphinx-autoapi/issues/248>_`, 
    the sphinx-autodoc maintainers decided to drop support for other languages in favor
    of plugins and such.

#. Sphinx does support domains

    Sphinx does support domains for python, javascript, and other. So we have
    options for documenting code in a sane way. Still able to use rST features.

While this is not ideal right now, we still will be able to generate nice
documentation for the project.