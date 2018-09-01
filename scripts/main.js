import { data } from "./alphabetsList";

(function() {
  "use strict";

  $(document).ready(init);
  //starting point
  function init() {
    var config = {
      scaleFlag: 0,
      isVolume: true,
      currentObject: {},
      currentId: 0,
      prev: 0
    };
    var rotateBtn = $(".rotate"),
      scaleBtn = $(".scale"),
      gotitBtn = $(".gotit"),
      prevBtn = $(".prev"),
      nextBtn = $(".next"),
      volumeBtn = $("#volume"),
      helpBtn = $(".help");

    if (!("speechSynthesis" in window)) {
      // Synthesis support. show volume button
      config.isVolume = false;
      $("#volume").css("display", "none");
    }

    addObject(data, config.currentId, 1);

    helpBtn.click(function(e) {
      e.preventDefault();
      $("#video_demo")[0].style.display = "block";
    });

    gotitBtn.click(function() {
      gotitBtn.parent().css({
        display: "none"
      });
    });

    rotateBtn.click(function() {
      if (rotateBtn.hasClass("rotate_fade")) {
        config.currentObject.emit("endRotate");
        rotateBtn.removeClass("rotate_fade");
      } else {
        config.currentObject.emit("rotate");
        rotateBtn.addClass("rotate_fade");
      }
    });

    scaleBtn.click(function() {
      let { scale, scaleOne, scaleTwo } = data[config.currentId];

      if (config.scaleFlag == 0) {
        config.scaleFlag = 1;
        config.currentObject.setAttribute("scale", (scale = scaleOne));
        scaleBtn.addClass("scale_one");
      } else if (config.scaleFlag == 1) {
        config.scaleFlag = 2;
        config.currentObject.setAttribute("scale", (scale = scaleTwo));
        scaleBtn.addClass("scale_two");
        scaleBtn.removeClass("scale_one");
      } else if (config.scaleFlag == 2) {
        config.scaleFlag = 0;
        config.currentObject.setAttribute("scale", (scale = scale));
        scaleBtn.removeClass("scale_two");
      }
    });

    prevBtn.click(function() {
      config.scaleFlag = 0;
      scaleBtn.removeClass("scale_one");
      scaleBtn.removeClass("scale_two");
      rotateBtn.removeClass("rotate_fade");
      if (config.currentId !== 0) {
        config.currentId -= 1;
      } else {
        config.currentId = data.length - 1;
      }

      addObject(data, config.currentId, config.currentId + 1);
      hideObjects(data, config.currentId);
      $(".title").html(data[config.currentId].description);
      speak();
    });

    nextBtn.click(function() {
      config.scaleFlag = 0;
      scaleBtn.removeClass("scale_one");
      scaleBtn.removeClass("scale_two");
      rotateBtn.removeClass("rotate_fade");
      if (config.currentId !== data.length - 1) {
        config.currentId += 1;
      } else {
        config.currentId = 0;
      }
      addObject(data, config.currentId, config.currentId - 1);
      //hide all rest of the objects
      hideObjects(data, config.currentId);
      $(".title").html(data[config.currentId].description);
      speak();
    });

    volumeBtn.click(function() {
      config.isVolume = !config.isVolume;
      if (config.isVolume) {
        volumeBtn.removeClass("rotate_fade");
      } else {
        volumeBtn.addClass("rotate_fade");
      }
    });

    function createEntity(currentData) {
      let entity = document.createElement("a-entity");

      entity.setAttribute("id", "obj_" + currentData.id);
      entity.setAttribute("rotation", "0 -90 0");
      entity.setAttribute("side", "double");
      entity.setAttribute("position", "0.0 0.2 0");
      entity.setAttribute("scale", currentData.scale);

      config.currentObject = entity;
      return entity;
    }

    function addObject(data, toRemove, toRemoveId) {
      let currentData = data[config.currentId];
      if (document.querySelector("#obj_" + currentData.id)) {
        document
          .querySelector("#obj_" + currentData.id)
          .setAttribute("visible", "true");
        return;
      }

      /** Create a 3d model entity and set as a current object */
      let entity = createEntity(currentData);

      if (currentData.isObj === true) {
        entity.setAttribute(
          "obj-model",
          "obj: #" + currentData.objAsset + "; mtl: #" + currentData.mtlAsset
        );
      } else {
        entity.setAttribute("gltf-model", "#" + currentData.assetId);
      }

      //Add animation
      let animation = document.createElement("a-animation");
      animation.setAttribute("attribute", "rotation");
      animation.setAttribute("begin", "rotate");
      animation.setAttribute("end", "endRotate");
      animation.setAttribute("dur", "26000");
      animation.setAttribute("fill", "forwards");
      animation.setAttribute("to", "0 270 0");
      animation.setAttribute("repeat", "indefinite");
      animation.setAttribute("easing", "linear");

      let marker = document.querySelector("#aframe-scene");
      entity.appendChild(animation);
      marker.appendChild(entity);
    }

    function hideObjects(data, currentId) {
      let current_id = currentId + 1;
      if (document.querySelector("#obj_" + data.id)) {
        document
          .querySelector("#obj_" + data.id)
          .setAttribute("visible", "true");
      }
      data.forEach(element => {
        if (document.querySelector("#obj_" + element.id) !== null) {
          if (element.id === current_id) {
            document
              .querySelector("#obj_" + element.id)
              .setAttribute("visible", true);
          } else {
            document
              .querySelector("#obj_" + element.id)
              .setAttribute("visible", false);
          }
        }
      });
    }
    //speak feature
    function speak() {
      if (!config.isVolume) return;
      let text =
        data[config.currentId].title +
        " for " +
        data[config.currentId].description;
      let msg = new SpeechSynthesisUtterance();
      msg.lang = "en-US";
      msg.rate = 8 / 10;
      msg.pitch = 1;
      msg.text = text;
      speechSynthesis.speak(msg);
    }
  }

  //Camera feature check
  function hasGetUserMedia() {
    return !!(
      navigator.getUserMedia ||
      navigator.webkitGetUserMedia ||
      navigator.mozGetUserMedia ||
      navigator.msGetUserMedia
    );
  }

  if (hasGetUserMedia()) {
    // Good to go!
    $("#splashScreen").css("display", "block");
  } else {
    let template = "<p>This feature is not supported in your browser.</p>";
    $("#noMedia").append(template);
    $("#noMedia").css("display", "block");
  }
})();
