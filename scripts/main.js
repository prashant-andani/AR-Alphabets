import data from './alphabetsList';

(function () {
  const script = document.createElement('script');
  script.src =    'https://rawgit.com/paulirish/memory-stats.js/master/bookmarklet.js';
  document.head.appendChild(script);
}());

const config = {
  scaleFlag: 0,
  isVolume: true,
  currentObject: {},
  currentId: 0,
  prev: 0,
};
(function () {
  // Tune these for your application.
  const MAX_MEMORY_LIMIT = 20 * 1048576; // 20MB
  const MAX_PERCENT_THRESHOLD = 90;

  if (
    !window.performance
    || !window.performance.memory
    || !window.requestAnimationFrame
  ) {
    return;
  }
  let hasAlarmed = false;

  requestAnimationFrame(function onFrame() {
    // Check if we've exceeded absolute memory limit
    if (performance.memory.usedJSHeapSize > MAX_MEMORY_LIMIT) {
      hasAlarmed = true;
      const overage = performance.memory.usedJSHeapSize - MAX_MEMORY_LIMIT;
      console.error(
        `Exceeded memory maximum limit by ${overage / 1024} K bytes`,
      );
    }

    // Check if we've exceeded relative memory limit for client
    if (
      performance.memory.usedJSHeapSize
      > (MAX_PERCENT_THRESHOLD / 100) * performance.memory.jsHeapSizeLimit
    ) {
      hasAlarmed = true;
      console.error(
        `Memory usage exceeded ${MAX_PERCENT_THRESHOLD}% of maximum: ${
          performance.memory.jsHeapSizeLimit
        }`,
      );
    }

    // Only alert once
    if (!hasAlarmed) {
      requestAnimationFrame(onFrame);
    }
  });
}());
function css(el, styles) {
  for (const property in styles) el.style[property] = styles[property];
}

(function () {
  function createEntity(currentData) {
    const entity = document.createElement('a-entity');

    entity.setAttribute('id', `obj_${currentData.id}`);
    entity.setAttribute('rotation', '0 -90 0');
    entity.setAttribute('side', 'double');
    entity.setAttribute('position', '0.0 0.2 0');
    entity.setAttribute('scale', currentData.scale);

    config.currentObject = entity;
    return entity;
  }

  function hideObjects(data, currentId) {
    const currentIdInc = currentId + 1;
    if (document.querySelector(`#obj_${data.id}`)) {
      document.querySelector(`#obj_${data.id}`).setAttribute('visible', 'true');
    }
    data.forEach((element) => {
      if (document.querySelector(`#obj_${element.id}`) !== null) {
        if (element.id === currentIdInc) {
          document
            .querySelector(`#obj_${element.id}`)
            .setAttribute('visible', true);
        } else {
          document
            .querySelector(`#obj_${element.id}`)
            .setAttribute('visible', false);
        }
      }
    });
  }
  // speak feature
  function speak() {
    if (!config.isVolume) return;
    const text = `${data[config.currentId].title} for ${
      data[config.currentId].description
    }`;
    const msg = new SpeechSynthesisUtterance();
    msg.lang = 'en-US';
    msg.rate = 8 / 10;
    msg.pitch = 1;
    msg.text = text;
    speechSynthesis.speak(msg);
  }

  function addObject(data) {
    const currentData = data[config.currentId];
    if (document.querySelector(`#obj_${currentData.id}`)) {
      document
        .querySelector(`#obj_${currentData.id}`)
        .setAttribute('visible', 'true');
      return;
    }

    /** Create a 3d model entity and set as a current object */
    const entity = createEntity(currentData);

    if (currentData.isObj === true) {
      entity.setAttribute(
        'obj-model',
        `obj: #${currentData.objAsset}; mtl: #${currentData.mtlAsset}`,
      );
    } else {
      entity.setAttribute('gltf-model', `#${currentData.assetId}`);
    }

    // Add animation
    const animation = document.createElement('a-animation');
    animation.setAttribute('attribute', 'rotation');
    animation.setAttribute('begin', 'rotate');
    animation.setAttribute('end', 'endRotate');
    animation.setAttribute('dur', '26000');
    animation.setAttribute('fill', 'forwards');
    animation.setAttribute('to', '0 270 0');
    animation.setAttribute('repeat', 'indefinite');
    animation.setAttribute('easing', 'linear');

    const marker = document.querySelector('#aframe-scene');
    entity.appendChild(animation);
    marker.appendChild(entity);
  }

  // starting point
  function init() {
    const rotateBtn = document.querySelector('.rotate');
    const scaleBtn = document.querySelector('.scale');
    const gotitBtn = document.querySelector('.gotit');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    const volumeBtn = document.querySelector('#volume');
    const helpBtn = document.querySelector('.help');

    if (!('speechSynthesis' in window)) {
      // Synthesis support. show volume button
      config.isVolume = false;
      $('#volume').css('display', 'none');
    }

    addObject(data, config.currentId, 1);

    helpBtn.click((e) => {
      e.preventDefault();
      document.querySelector('#video_demo')[0].style.display = 'block';
    });

    gotitBtn.click(() => {
      gotitBtn.parent().css({
        display: 'none',
      });
    });

    rotateBtn.click(() => {
      if (rotateBtn.hasClass('rotate_fade')) {
        config.currentObject.emit('endRotate');
        rotateBtn.removeClass('rotate_fade');
      } else {
        config.currentObject.emit('rotate');
        rotateBtn.addClass('rotate_fade');
      }
    });

    scaleBtn.click(() => {
      let { scale, scaleOne, scaleTwo } = data[config.currentId];

      if (config.scaleFlag === 0) {
        config.scaleFlag = 1;
        config.currentObject.setAttribute('scale', (scale = scaleOne));
        scaleBtn.addClass('scale_one');
      } else if (config.scaleFlag === 1) {
        config.scaleFlag = 2;
        config.currentObject.setAttribute('scale', (scale = scaleTwo));
        scaleBtn.addClass('scale_two');
        scaleBtn.removeClass('scale_one');
      } else if (config.scaleFlag === 2) {
        config.scaleFlag = 0;
        config.currentObject.setAttribute('scale', (scale = scale));
        scaleBtn.removeClass('scale_two');
      }
    });

    prevBtn.click(() => {
      config.scaleFlag = 0;
      scaleBtn.removeClass('scale_one');
      scaleBtn.removeClass('scale_two');
      rotateBtn.removeClass('rotate_fade');
      if (config.currentId !== 0) {
        config.currentId -= 1;
      } else {
        config.currentId = data.length - 1;
      }

      addObject(data, config.currentId, config.currentId + 1);
      hideObjects(data, config.currentId);
      document.querySelector('.title').html(data[config.currentId].description);
      speak();
    });

    nextBtn.click(() => {
      config.scaleFlag = 0;
      scaleBtn.removeClass('scale_one');
      scaleBtn.removeClass('scale_two');
      rotateBtn.removeClass('rotate_fade');
      if (config.currentId !== data.length - 1) {
        config.currentId += 1;
      } else {
        config.currentId = 0;
      }
      addObject(data, config.currentId, config.currentId - 1);
      // hide all rest of the objects
      hideObjects(data, config.currentId);
      document.querySelector('.title').html(data[config.currentId].description);
      speak();
    });

    volumeBtn.click(() => {
      config.isVolume = !config.isVolume;
      if (config.isVolume) {
        volumeBtn.removeClass('rotate_fade');
      } else {
        volumeBtn.addClass('rotate_fade');
      }
    });
  }

  // Camera feature check
  function hasGetUserMedia() {
    return !!(
      navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia
      || navigator.msGetUserMedia
    );
  }

  if (hasGetUserMedia()) {
    // Good to go!
    const splashScreen = document.querySelector('#splashScreen');
    // example
    css(splashScreen, { display: 'block' });
  } else {
    const template = 'This feature is not supported in your browser.';
    const noMedia = document.querySelector('#noMedia');
    noMedia.append(template);
    css(noMedia, { display: 'block' });
  }
  window.onload = init;
}());
