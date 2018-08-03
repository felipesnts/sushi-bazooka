var Sushi;

(function (Sushi) {
	"use strict";

	var Util = Sushi.Util;

	var Css = {};

	Css.rgbToHex = function (rgb) {
		var converted = rgb;

		if (rgb.search("rgb") !== -1) {
			rgb = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+))?\)$/);

			converted = "#"
				+ Util.Math.toHex(rgb[1])
				+ Util.Math.toHex(rgb[2])
				+ Util.Math.toHex(rgb[3]);
		}

		return converted;
	};


	Css.deltaTransformPoint = function (matrix, point) {
		var dx = point.x * matrix.a + point.y * matrix.c;
		var dy = point.x * matrix.b + point.y * matrix.d;

		return { x: dx, y: dy };
	};


	Css.decomposeTransformMatrix = function (matrix) {
		// @see https://gist.github.com/2052247

		// calculate delta transform point
		var px = Util.deltaTransformPoint(matrix, { x: 0, y: 1 });
		var py = Util.deltaTransformPoint(matrix, { x: 1, y: 0 });

		// calculate skew
		var skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
		var skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

		var radians = Math.atan2(matrix.b, matrix.a);

		if (radians < 0) {
			radians += (2 * Math.PI);
		}

		var angle = Math.round(radians * (180/Math.PI));

		return {
			translateX: matrix.e,
			translateY: matrix.f,
			scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
			scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
			skewX: skewX,
			skewY: skewY,
			rotation: angle,
		};
	};


	/**
	 * Returns the rotation angle of an element
	 *
	 * Also works with SVG elements.
	 *
	 * @param {HTMLElement} element The element to get the rotation value from
	 * @param {Boolean} round Whether to round the result or not
	 *
	 * @returns {number} Rotation value in degrees
	 */
	Css.getRotationAngle = function (element, round) {
		var style;
		var matrix;
		var angle = 0;
		var matrixString;

		round = round || false;

		if (element.getCTM !== void 0) {
			matrix = element.getCTM();
		}
		else {
			style = window.getComputedStyle(element);

			matrixString = style.transform
				|| style.webkitTransform
				|| style.mozTransform
				|| style.msTransform;

			if (matrixString !== "none") {
				matrix = matrixString.split("(")[1].split(")")[0].split(",");
			}
		}

		if (matrix) {
			var a = matrix.a || matrix[0];
			var b = matrix.b || matrix[1];
			var radians = Math.atan2(b, a);

			if (radians < 0) {
				radians += (2 * Math.PI);
			}

			angle = (radians * (180/Math.PI));

			if (round) {
				angle = Math.round(angle);
			}
		}

		return (angle < 0) ? (angle + 360) : angle;
	};


	/**
	 * Returns the maximum transition duration from an element taking the delays into account
	 *
	 * @param {HTMLElement} element Element to get values from
	 * @param {Boolean} ignoreDelay Whether to ignore or not the delay value
	 *
	 * @returns {number} Transition duration in milliseconds
	 */
	Css.getMaxTransitionDuration = function (element, ignoreDelay) {
		ignoreDelay = ignoreDelay || false;

		var transitionDuration = element.ownerDocument.defaultView
			.getComputedStyle(element, null).transitionDuration.split(", ");

		var transitionDelay = element.ownerDocument.defaultView
			.getComputedStyle(element, null).transitionDelay.split(", ");

		var maxDuration = 0;

		for (var i = 0; i < transitionDuration.length; i++) {
			var duration = 0;

			if (transitionDuration[i] !== "") {
				duration += parseFloat(transitionDuration[i]);
			}

			if ((transitionDelay[i] !== "") && !ignoreDelay) {
				duration += parseFloat(transitionDelay[i]);
			}

			maxDuration = Math.max(duration, maxDuration);
		}

		return maxDuration * 1000;
	};

	Css.getOffset = function (element, context) {
		context = context || document.body;

		var contextRect = context.getBoundingClientRect();
		var elementRect = element.getBoundingClientRect();
		var offset = {
			top: (elementRect.top - contextRect.top),
			right: (elementRect.right - contextRect.right),
			bottom: (elementRect.bottom - contextRect.bottom),
			left: (elementRect.left - contextRect.left),
		};

		return offset;
	};

	Css.getWidth = function (element, accountForMargins) {
		var style = window.getComputedStyle(element);

		return (
			element.clientWidth
			+ style.paddingRight
			+ style.paddingLeft
			+ style.borderRightWidth
			+ style.borderLeftWidth
		)
		+ accountForMargins
			? (style.marginRight + style.marginLeft)
			: 0
		;
	};

	Css.getHeight = function (element, accountForMargins) {
		var style = window.getComputedStyle(element);

		return (
			element.clientHeight
			+ style.paddingTop
			+ style.paddingBottom
			+ style.borderRightHeight
			+ style.borderLeftHeight
		)
		+ accountForMargins
			? (style.marginTop + style.marginBottom)
			: 0
		;
	};

	Util.Css = Css;
})(Sushi || (Sushi = {}));
