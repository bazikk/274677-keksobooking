'use strict';
(function () {
  var constants = window.constants;
  var backend = window.backend;
  window.util = {
    firstTouchFlag: true,
    getTopPosition: function (block) {
      return +getComputedStyle(block).top.slice(
          0,
          getComputedStyle(block).top.length - 2
      );
    },

    getLeftPosition: function (block) {
      return +getComputedStyle(block).left.slice(
          0,
          getComputedStyle(block).left.length - 2
      );
    },

    createNode: function (template) {
      return template.cloneNode(true);
    },

    getTextContent: function (data) {
      return data ? data : '';
    },

    hideElement: function (element) {
      element.classList.add('hidden');
    },

    renderBefore: function (parentElement, beforeElement, childElement) {
      if (childElement) {
        var childClone = window.util.createNode(childElement);
        parentElement.insertBefore(childClone, beforeElement);
      }
    },

    filterDataForOffer: function (data) {
      return data.filter(function (el) {
        return el.offer ? true : false;
      });
    },

    getDataCount: function (data) {
      return data.length > constants.PINS_COUNT
        ? constants.PINS_COUNT
        : data.length;
    },

    fillTemplateWithData: function (template, data, func) {
      var fragment = document.createDocumentFragment();
      var filteredData = window.util.filterDataForOffer(data);
      var dataCount = window.util.getDataCount(filteredData);

      for (var i = 0; i < dataCount; i++) {
        var elem = window.util.createNode(template);
        if (template.classList.contains('map__pin')) {
          elem.classList.add('map__pin--' + i);
        }
        fragment.appendChild(func(elem, filteredData[i]));
      }
      return fragment;
    },

    isEscEvent: function (e, action) {
      if (e.keyCode === constants.ESC_KEYCODE) {
        action();
      }
    },

    createErrorAlert: function () {
      var errorTemplate = document
        .querySelector('#error')
        .content.querySelector('.error');
      var errorMessage = window.util.createNode(errorTemplate);
      var main = document.querySelector('main');
      main.insertAdjacentElement('afterbegin', errorMessage);

      var deleteErrorMessage = function () {
        main.removeChild(errorMessage);
        document.removeEventListener('keyup', onErrorMessageEscPress);
      };

      var onErrorMessageEscPress = function (e) {
        window.util.isEscEvent(e, deleteErrorMessage);
      };

      errorMessage.addEventListener('click', deleteErrorMessage);
      document.addEventListener('keyup', onErrorMessageEscPress);
    },

    createSuccessMessage: function () {
      var successTemplate = document
        .querySelector('#success')
        .content.querySelector('.success');
      var successMessage = window.util.createNode(successTemplate);
      var main = document.querySelector('main');
      main.insertAdjacentElement('afterbegin', successMessage);

      var deleteSuccessMessage = function () {
        main.removeChild(successMessage);
        document.removeEventListener('keyup', onSuccessMessageEscPress);
      };

      var onSuccessMessageEscPress = function (e) {
        window.util.isEscEvent(e, deleteSuccessMessage);
      };

      successMessage.addEventListener('click', deleteSuccessMessage);
      document.addEventListener('keyup', onSuccessMessageEscPress);
    },

    loadCardsAndPins: function (data) {
      if (window.util.firstTouchFlag) {
        backend.response = data;
        window.util.firstTouchFlag = false;
      }
      window.createCards(data);
      window.createPins(data);
    },

    deletePins: function () {
      var mapPins = document.querySelectorAll('.map__pins .map__pin');
      mapPins.forEach(function (el) {
        if (el.classList.contains('map__pin--main')) {
          el.style.left = constants.MAIN_PIN.DEFAULT_LEFT + 'px';
          el.style.top = constants.MAIN_PIN.DEFAULT_TOP + 'px';
        } else {
          document.querySelector('.map__pins').removeChild(el);
        }
      });
    },

    activatePage: function () {
      document.querySelector('.map').classList.remove('map--faded');

      var adForm = document.querySelector('.ad-form');
      var adFormFieldsets = adForm.querySelectorAll('fieldset');
      var mapFiltersDisabledItems = document.querySelectorAll(
          '.map__filters *:disabled'
      );

      adFormFieldsets.forEach(function (item) {
        item.disabled = false;
      });
      adForm.classList.remove('ad-form--disabled');

      mapFiltersDisabledItems.forEach(function (item) {
        item.disabled = false;
      });
    },

    deleteHousePreviews: function () {
      var photosContainer = document.querySelector('.ad-form__photo-container');
      var renderedPhotos = document.querySelectorAll('.ad-form__photo');
      if (renderedPhotos) {
        for (var i = 0; i < renderedPhotos.length; i++) {
          photosContainer.removeChild(renderedPhotos[i]);
        }
      }
    },

    deleteAvatarPreview: function () {
      document.querySelector('.ad-form-header__preview img').src =
        'img/muffin-grey.svg';
    },

    resetForms: function () {
      var adForm = document.querySelector('.ad-form');
      var adFormFieldsets = adForm.querySelectorAll('fieldset');
      var housePrice = document.querySelector('#price');
      adFormFieldsets.forEach(function (item) {
        item.disabled = true;
      });
      adForm.classList.add('ad-form--disabled');

      housePrice.placeholder = constants.AccomodationPrice.FLAT;
      adForm.reset();
      document.querySelector('.map__filters').reset();
      window.util.deleteHousePreviews();
      window.util.deleteAvatarPreview();
    },

    deactivatePage: function () {
      document.querySelector('.map').classList.add('map--faded');

      window.util.firstTouchFlag = true;
      window.util.resetForms();
      window.util.deletePins();
      window.util.setAddress();
      window.util.closeCard();
    },

    publishAdvert: function () {
      window.util.deactivatePage();
      window.util.createSuccessMessage();
    },

    setAddress: function () {
      var mainPin = document.querySelector('.map__pin--main');
      var adressInput = document.querySelector('#address');
      var mainPinLeft = window.util.getLeftPosition(mainPin);
      var mainPinTop = window.util.getTopPosition(mainPin);

      var left = Math.floor(mainPinLeft + constants.MAIN_PIN.WIDTH / 2);
      var top = Math.floor(mainPinTop + constants.MAIN_PIN.HEIGHT);

      adressInput.setAttribute('value', left + ', ' + top); // Firefox показывает пустой инпут, если задавать value через input.value. Через setAttribute все работает.
    },

    closeCard: function () {
      var map = document.querySelector('.map');
      var openedCard = document.querySelector('.map__card');
      var activePin = document.querySelector('.map__pin--active');
      if (openedCard) {
        map.removeChild(openedCard);
        if (activePin) {
          activePin.classList.remove('map__pin--active');
        }
      }
      document.removeEventListener('keyup', window.util.onCardEscPress);
    },

    openCard: function (target) {
      var map = document.querySelector('.map');
      var mapFilterContainer = document.querySelector(
          '.map__filters-container'
      );
      var pinClassName = +target.className.split('--')[1];
      window.util.renderBefore(
          map,
          mapFilterContainer,
          window.map.cards.children[pinClassName]
      );
      target.classList.add('map__pin--active');
    },

    onCardEscPress: function (e) {
      window.util.isEscEvent(e, window.util.closeCard);
    }
  };
})();
