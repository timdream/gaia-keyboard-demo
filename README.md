# Gaia Keyboard Demo

This is a off-work fun project to bring the built-in keyboard of [Mozilla Firefox OS](https://mozilla.org/firefoxos/) to the web, and make available on any device. 

## Getting Started

Clone this repo, and execute the following commands:

    git submodule init
    git submodule update

## Underneath

It pulls the keyboard codebase from [Gaia](https://github.com/mozilla-b2g/gaia), and re-implements `navigator.mozInputMethod` API so we could communicate between the fake input and the app.

The input has to be a fake one so the native keyboard will not pop-up when you try this page on a touchscreen.

Additionally, other missing APIs that is not provided on Safari Mobile are shimmed.
