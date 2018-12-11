'use strict';
(function () {
  var util = window.util;

  var fillPinWithData = function (pin, data) {
    var pinStyles = getComputedStyle(pin);
    var pinWidth = +pinStyles.width.slice(0, pinStyles.width.length - 2);
    var pinHeight = +pinStyles.width.slice(0, pinStyles.height.length - 2);
    var pinImage = pin.querySelector('img');

    pin.style.left = data.location.x + (pinWidth / 2) + 'px';
    pin.style.top = data.location.y + pinHeight + 'px';
    pinImage.src = data.author.avatar;
    pinImage.alt = data.offer.title;

    return pin;
  };

  window.createPins = function (data) {
    var pinTemplate = document.querySelector('#pin').content.querySelector('.map__pin');
    var mapOfPins = document.querySelector('.map__pins');

    var pins = util.fillTemplateWithData(pinTemplate, data, fillPinWithData);
    util.render(mapOfPins, pins);
  };
})();