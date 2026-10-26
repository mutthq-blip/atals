( function () {

	/**
 * Full-screen textured quad shader
 */
	var CopyShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'opacity': {
				value: 1.0
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;

		}`
	};

	THREE.CopyShader = CopyShader;

} )();
( function () {

	/**
 * TODO
 */

	const SAOShader = {
		defines: {
			'NUM_SAMPLES': 7,
			'NUM_RINGS': 4,
			'NORMAL_TEXTURE': 0,
			'DIFFUSE_TEXTURE': 0,
			'DEPTH_PACKING': 1,
			'PERSPECTIVE_CAMERA': 1
		},
		uniforms: {
			'tDepth': {
				value: null
			},
			'tDiffuse': {
				value: null
			},
			'tNormal': {
				value: null
			},
			'size': {
				value: new THREE.Vector2( 512, 512 )
			},
			'cameraNear': {
				value: 1
			},
			'cameraFar': {
				value: 100
			},
			'cameraProjectionMatrix': {
				value: new THREE.Matrix4()
			},
			'cameraInverseProjectionMatrix': {
				value: new THREE.Matrix4()
			},
			'scale': {
				value: 1.0
			},
			'intensity': {
				value: 0.1
			},
			'bias': {
				value: 0.5
			},
			'minResolution': {
				value: 0.0
			},
			'kernelRadius': {
				value: 100.0
			},
			'randomSeed': {
				value: 0.0
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {
			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
		fragmentShader:
  /* glsl */
  `

		#include <common>

		varying vec2 vUv;

		#if DIFFUSE_TEXTURE == 1
		uniform sampler2D tDiffuse;
		#endif

		uniform sampler2D tDepth;

		#if NORMAL_TEXTURE == 1
		uniform sampler2D tNormal;
		#endif

		uniform float cameraNear;
		uniform float cameraFar;
		uniform mat4 cameraProjectionMatrix;
		uniform mat4 cameraInverseProjectionMatrix;

		uniform float scale;
		uniform float intensity;
		uniform float bias;
		uniform float kernelRadius;
		uniform float minResolution;
		uniform vec2 size;
		uniform float randomSeed;

		// RGBA depth

		#include <packing>

		vec4 getDefaultColor( const in vec2 screenPosition ) {
			#if DIFFUSE_TEXTURE == 1
			return texture2D( tDiffuse, vUv );
			#else
			return vec4( 1.0 );
			#endif
		}

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}

		vec3 getViewPosition( const in vec2 screenPosition, const in float depth, const in float viewZ ) {
			float clipW = cameraProjectionMatrix[2][3] * viewZ + cameraProjectionMatrix[3][3];
			vec4 clipPosition = vec4( ( vec3( screenPosition, depth ) - 0.5 ) * 2.0, 1.0 );
			clipPosition *= clipW; // unprojection.

			return ( cameraInverseProjectionMatrix * clipPosition ).xyz;
		}

		vec3 getViewNormal( const in vec3 viewPosition, const in vec2 screenPosition ) {
			#if NORMAL_TEXTURE == 1
			return unpackRGBToNormal( texture2D( tNormal, screenPosition ).xyz );
			#else
			return normalize( cross( dFdx( viewPosition ), dFdy( viewPosition ) ) );
			#endif
		}

		float scaleDividedByCameraFar;
		float minResolutionMultipliedByCameraFar;

		float getOcclusion( const in vec3 centerViewPosition, const in vec3 centerViewNormal, const in vec3 sampleViewPosition ) {
			vec3 viewDelta = sampleViewPosition - centerViewPosition;
			float viewDistance = length( viewDelta );
			float scaledScreenDistance = scaleDividedByCameraFar * viewDistance;

			return max(0.0, (dot(centerViewNormal, viewDelta) - minResolutionMultipliedByCameraFar) / scaledScreenDistance - bias) / (1.0 + pow2( scaledScreenDistance ) );
		}

		// moving costly divides into consts
		const float ANGLE_STEP = PI2 * float( NUM_RINGS ) / float( NUM_SAMPLES );
		const float INV_NUM_SAMPLES = 1.0 / float( NUM_SAMPLES );

		float getAmbientOcclusion( const in vec3 centerViewPosition ) {
			// precompute some variables require in getOcclusion.
			scaleDividedByCameraFar = scale / cameraFar;
			minResolutionMultipliedByCameraFar = minResolution * cameraFar;
			vec3 centerViewNormal = getViewNormal( centerViewPosition, vUv );

			// jsfiddle that shows sample pattern: https://jsfiddle.net/a16ff1p7/
			float angle = rand( vUv + randomSeed ) * PI2;
			vec2 radius = vec2( kernelRadius * INV_NUM_SAMPLES ) / size;
			vec2 radiusStep = radius;

			float occlusionSum = 0.0;
			float weightSum = 0.0;

			for( int i = 0; i < NUM_SAMPLES; i ++ ) {
				vec2 sampleUv = vUv + vec2( cos( angle ), sin( angle ) ) * radius;
				radius += radiusStep;
				angle += ANGLE_STEP;

				float sampleDepth = getDepth( sampleUv );
				if( sampleDepth >= ( 1.0 - EPSILON ) ) {
					continue;
				}

				float sampleViewZ = getViewZ( sampleDepth );
				vec3 sampleViewPosition = getViewPosition( sampleUv, sampleDepth, sampleViewZ );
				occlusionSum += getOcclusion( centerViewPosition, centerViewNormal, sampleViewPosition );
				weightSum += 1.0;
			}

			if( weightSum == 0.0 ) discard;

			return occlusionSum * ( intensity / weightSum );
		}

		void main() {
			float centerDepth = getDepth( vUv );
			if( centerDepth >= ( 1.0 - EPSILON ) ) {
				discard;
			}

			float centerViewZ = getViewZ( centerDepth );
			vec3 viewPosition = getViewPosition( vUv, centerDepth, centerViewZ );

			float ambientOcclusion = getAmbientOcclusion( viewPosition );

			gl_FragColor = getDefaultColor( vUv );
			gl_FragColor.xyz *=  1.0 - ambientOcclusion;
		}`
	};

	THREE.SAOShader = SAOShader;

} )();
( function () {

	/**
 * TODO
 */

	const DepthLimitedBlurShader = {
		defines: {
			'KERNEL_RADIUS': 4,
			'DEPTH_PACKING': 1,
			'PERSPECTIVE_CAMERA': 1
		},
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'size': {
				value: new THREE.Vector2( 512, 512 )
			},
			'sampleUvOffsets': {
				value: [ new THREE.Vector2( 0, 0 ) ]
			},
			'sampleWeights': {
				value: [ 1.0 ]
			},
			'tDepth': {
				value: null
			},
			'cameraNear': {
				value: 10
			},
			'cameraFar': {
				value: 1000
			},
			'depthCutoff': {
				value: 10
			}
		},
		vertexShader:
  /* glsl */
  `

		#include <common>

		uniform vec2 size;

		varying vec2 vUv;
		varying vec2 vInvSize;

		void main() {
			vUv = uv;
			vInvSize = 1.0 / size;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
		}`,
		fragmentShader:
  /* glsl */
  `

		#include <common>
		#include <packing>

		uniform sampler2D tDiffuse;
		uniform sampler2D tDepth;

		uniform float cameraNear;
		uniform float cameraFar;
		uniform float depthCutoff;

		uniform vec2 sampleUvOffsets[ KERNEL_RADIUS + 1 ];
		uniform float sampleWeights[ KERNEL_RADIUS + 1 ];

		varying vec2 vUv;
		varying vec2 vInvSize;

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, cameraNear, cameraFar );
			#else
			return orthographicDepthToViewZ( depth, cameraNear, cameraFar );
			#endif
		}

		void main() {
			float depth = getDepth( vUv );
			if( depth >= ( 1.0 - EPSILON ) ) {
				discard;
			}

			float centerViewZ = -getViewZ( depth );
			bool rBreak = false, lBreak = false;

			float weightSum = sampleWeights[0];
			vec4 diffuseSum = texture2D( tDiffuse, vUv ) * weightSum;

			for( int i = 1; i <= KERNEL_RADIUS; i ++ ) {

				float sampleWeight = sampleWeights[i];
				vec2 sampleUvOffset = sampleUvOffsets[i] * vInvSize;

				vec2 sampleUv = vUv + sampleUvOffset;
				float viewZ = -getViewZ( getDepth( sampleUv ) );

				if( abs( viewZ - centerViewZ ) > depthCutoff ) rBreak = true;

				if( ! rBreak ) {
					diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;
					weightSum += sampleWeight;
				}

				sampleUv = vUv - sampleUvOffset;
				viewZ = -getViewZ( getDepth( sampleUv ) );

				if( abs( viewZ - centerViewZ ) > depthCutoff ) lBreak = true;

				if( ! lBreak ) {
					diffuseSum += texture2D( tDiffuse, sampleUv ) * sampleWeight;
					weightSum += sampleWeight;
				}

			}

			gl_FragColor = diffuseSum / weightSum;
		}`
	};
	const BlurShaderUtils = {
		createSampleWeights: function ( kernelRadius, stdDev ) {

			const weights = [];

			for ( let i = 0; i <= kernelRadius; i ++ ) {

				weights.push( gaussian( i, stdDev ) );

			}

			return weights;

		},
		createSampleOffsets: function ( kernelRadius, uvIncrement ) {

			const offsets = [];

			for ( let i = 0; i <= kernelRadius; i ++ ) {

				offsets.push( uvIncrement.clone().multiplyScalar( i ) );

			}

			return offsets;

		},
		configure: function ( material, kernelRadius, stdDev, uvIncrement ) {

			material.defines[ 'KERNEL_RADIUS' ] = kernelRadius;
			material.uniforms[ 'sampleUvOffsets' ].value = BlurShaderUtils.createSampleOffsets( kernelRadius, uvIncrement );
			material.uniforms[ 'sampleWeights' ].value = BlurShaderUtils.createSampleWeights( kernelRadius, stdDev );
			material.needsUpdate = true;

		}
	};

	function gaussian( x, stdDev ) {

		return Math.exp( - ( x * x ) / ( 2.0 * ( stdDev * stdDev ) ) ) / ( Math.sqrt( 2.0 * Math.PI ) * stdDev );

	}

	THREE.BlurShaderUtils = BlurShaderUtils;
	THREE.DepthLimitedBlurShader = DepthLimitedBlurShader;

} )();
( function () {

	/**
 * Unpack RGBA depth shader
 * - show RGBA encoded depth as monochrome color
 */
	const UnpackDepthRGBAShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'opacity': {
				value: 1.0
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		#include <packing>

		void main() {

			float depth = 1.0 - unpackRGBAToDepth( texture2D( tDiffuse, vUv ) );
			gl_FragColor = vec4( vec3( depth ), opacity );

		}`
	};

	THREE.UnpackDepthRGBAShader = UnpackDepthRGBAShader;

} )();
( function () {

	/**
 * Depth-of-field shader with bokeh
 * ported from GLSL shader by Martins Upitis
 * http://artmartinsh.blogspot.com/2010/02/glsl-lens-blur-filter-with-bokeh.html
 */
	const BokehShader = {
		defines: {
			'DEPTH_PACKING': 1,
			'PERSPECTIVE_CAMERA': 1
		},
		uniforms: {
			'tColor': {
				value: null
			},
			'tDepth': {
				value: null
			},
			'focus': {
				value: 1.0
			},
			'aspect': {
				value: 1.0
			},
			'aperture': {
				value: 0.025
			},
			'maxblur': {
				value: 0.01
			},
			'nearClip': {
				value: 1.0
			},
			'farClip': {
				value: 1000.0
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		#include <common>

		varying vec2 vUv;

		uniform sampler2D tColor;
		uniform sampler2D tDepth;

		uniform float maxblur; // max blur amount
		uniform float aperture; // aperture - bigger values for shallower depth of field

		uniform float nearClip;
		uniform float farClip;

		uniform float focus;
		uniform float aspect;

		#include <packing>

		float getDepth( const in vec2 screenPosition ) {
			#if DEPTH_PACKING == 1
			return unpackRGBAToDepth( texture2D( tDepth, screenPosition ) );
			#else
			return texture2D( tDepth, screenPosition ).x;
			#endif
		}

		float getViewZ( const in float depth ) {
			#if PERSPECTIVE_CAMERA == 1
			return perspectiveDepthToViewZ( depth, nearClip, farClip );
			#else
			return orthographicDepthToViewZ( depth, nearClip, farClip );
			#endif
		}


		void main() {

			vec2 aspectcorrect = vec2( 1.0, aspect );

			float viewZ = getViewZ( getDepth( vUv ) );

			float factor = ( focus + viewZ ); // viewZ is <= 0, so this is a difference equation

			vec2 dofblur = vec2 ( clamp( factor * aperture, -maxblur, maxblur ) );

			vec2 dofblur9 = dofblur * 0.9;
			vec2 dofblur7 = dofblur * 0.7;
			vec2 dofblur4 = dofblur * 0.4;

			vec4 col = vec4( 0.0 );

			col += texture2D( tColor, vUv.xy );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15, -0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.15,  0.37 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.37,  0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.37, -0.15 ) * aspectcorrect ) * dofblur9 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.15, -0.37 ) * aspectcorrect ) * dofblur9 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.40,  0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur7 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur7 );

			col += texture2D( tColor, vUv.xy + ( vec2(  0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,  -0.4  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29,  0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.4,   0.0  ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2( -0.29, -0.29 ) * aspectcorrect ) * dofblur4 );
			col += texture2D( tColor, vUv.xy + ( vec2(  0.0,   0.4  ) * aspectcorrect ) * dofblur4 );

			gl_FragColor = col / 41.0;
			gl_FragColor.a = 1.0;

		}`
	};

	THREE.BokehShader = BokehShader;

} )();
( function () {

	/**
 * Gamma Correction Shader
 * http://en.wikipedia.org/wiki/gamma_correction
 */
	const GammaCorrectionShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 tex = texture2D( tDiffuse, vUv );

			gl_FragColor = LinearTosRGB( tex ); // optional: LinearToGamma( tex, float( GAMMA_FACTOR ) );

		}`
	};

	THREE.GammaCorrectionShader = GammaCorrectionShader;

} )();
( function () {

	/**
 * Vignette shader
 * based on PaintEffect postprocess from ro.me
 * http://code.google.com/p/3-dreams-of-black/source/browse/deploy/js/effects/PaintEffect.js
 */
	const VignetteShader = {
		uniforms: {
			'tDiffuse': {
				value: null
			},
			'offset': {
				value: 1.0
			},
			'darkness': {
				value: 1.0
			}
		},
		vertexShader:
  /* glsl */
  `

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,
		fragmentShader:
  /* glsl */
  `

		uniform float offset;
		uniform float darkness;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			// Eskil's vignette

			vec4 texel = texture2D( tDiffuse, vUv );
			vec2 uv = ( vUv - vec2( 0.5 ) ) * vec2( offset );
			gl_FragColor = vec4( mix( texel.rgb, vec3( 1.0 - darkness ), dot( uv, uv ) ), texel.a );

		}`
	};

	THREE.VignetteShader = VignetteShader;

} )();
( function () {

	class EffectComposer {

		constructor( renderer, renderTarget ) {

			this.renderer = renderer;

			if ( renderTarget === undefined ) {

				const parameters = {
					minFilter: THREE.LinearFilter,
					magFilter: THREE.LinearFilter,
					format: THREE.RGBAFormat
				};
				const size = renderer.getSize( new THREE.Vector2() );
				this._pixelRatio = renderer.getPixelRatio();
				this._width = size.width;
				this._height = size.height;
				renderTarget = new THREE.WebGLRenderTarget( this._width * this._pixelRatio, this._height * this._pixelRatio, parameters );
				renderTarget.texture.name = 'EffectComposer.rt1';

			} else {

				this._pixelRatio = 1;
				this._width = renderTarget.width;
				this._height = renderTarget.height;

			}

			this.renderTarget1 = renderTarget;
			this.renderTarget2 = renderTarget.clone();
			this.renderTarget2.texture.name = 'EffectComposer.rt2';
			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;
			this.renderToScreen = true;
			this.passes = []; // dependencies

			if ( THREE.CopyShader === undefined ) {

				console.error( 'THREE.EffectComposer relies on THREE.CopyShader' );

			}

			if ( THREE.ShaderPass === undefined ) {

				console.error( 'THREE.EffectComposer relies on THREE.ShaderPass' );

			}

			this.copyPass = new THREE.ShaderPass( THREE.CopyShader );
			this.clock = new THREE.Clock();

		}

		swapBuffers() {

			const tmp = this.readBuffer;
			this.readBuffer = this.writeBuffer;
			this.writeBuffer = tmp;

		}

		addPass( pass ) {

			this.passes.push( pass );
			pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		insertPass( pass, index ) {

			this.passes.splice( index, 0, pass );
			pass.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

		}

		removePass( pass ) {

			const index = this.passes.indexOf( pass );

			if ( index !== - 1 ) {

				this.passes.splice( index, 1 );

			}

		}

		isLastEnabledPass( passIndex ) {

			for ( let i = passIndex + 1; i < this.passes.length; i ++ ) {

				if ( this.passes[ i ].enabled ) {

					return false;

				}

			}

			return true;

		}

		render( deltaTime ) {

			// deltaTime value is in seconds
			if ( deltaTime === undefined ) {

				deltaTime = this.clock.getDelta();

			}

			const currentRenderTarget = this.renderer.getRenderTarget();
			let maskActive = false;

			for ( let i = 0, il = this.passes.length; i < il; i ++ ) {

				const pass = this.passes[ i ];
				if ( pass.enabled === false ) continue;
				pass.renderToScreen = this.renderToScreen && this.isLastEnabledPass( i );
				pass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime, maskActive );

				if ( pass.needsSwap ) {

					if ( maskActive ) {

						const context = this.renderer.getContext();
						const stencil = this.renderer.state.buffers.stencil; //context.stencilFunc( context.NOTEQUAL, 1, 0xffffffff );

						stencil.setFunc( context.NOTEQUAL, 1, 0xffffffff );
						this.copyPass.render( this.renderer, this.writeBuffer, this.readBuffer, deltaTime ); //context.stencilFunc( context.EQUAL, 1, 0xffffffff );

						stencil.setFunc( context.EQUAL, 1, 0xffffffff );

					}

					this.swapBuffers();

				}

				if ( THREE.MaskPass !== undefined ) {

					if ( pass instanceof THREE.MaskPass ) {

						maskActive = true;

					} else if ( pass instanceof THREE.ClearMaskPass ) {

						maskActive = false;

					}

				}

			}

			this.renderer.setRenderTarget( currentRenderTarget );

		}

		reset( renderTarget ) {

			if ( renderTarget === undefined ) {

				const size = this.renderer.getSize( new THREE.Vector2() );
				this._pixelRatio = this.renderer.getPixelRatio();
				this._width = size.width;
				this._height = size.height;
				renderTarget = this.renderTarget1.clone();
				renderTarget.setSize( this._width * this._pixelRatio, this._height * this._pixelRatio );

			}

			this.renderTarget1.dispose();
			this.renderTarget2.dispose();
			this.renderTarget1 = renderTarget;
			this.renderTarget2 = renderTarget.clone();
			this.writeBuffer = this.renderTarget1;
			this.readBuffer = this.renderTarget2;

		}

		setSize( width, height ) {

			this._width = width;
			this._height = height;
			const effectiveWidth = this._width * this._pixelRatio;
			const effectiveHeight = this._height * this._pixelRatio;
			this.renderTarget1.setSize( effectiveWidth, effectiveHeight );
			this.renderTarget2.setSize( effectiveWidth, effectiveHeight );

			for ( let i = 0; i < this.passes.length; i ++ ) {

				this.passes[ i ].setSize( effectiveWidth, effectiveHeight );

			}

		}

		setPixelRatio( pixelRatio ) {

			this._pixelRatio = pixelRatio;
			this.setSize( this._width, this._height );

		}

	}

	class Pass {

		constructor() {

			// if set to true, the pass is processed by the composer
			this.enabled = true; // if set to true, the pass indicates to swap read and write buffer after rendering

			this.needsSwap = true; // if set to true, the pass clears its buffer before rendering

			this.clear = false; // if set to true, the result of the pass is rendered to screen. This is set automatically by EffectComposer.

			this.renderToScreen = false;

		}

		setSize( ) {}

		render( ) {

			console.error( 'THREE.Pass: .render() must be implemented in derived pass.' );

		}

	} // Helper for passes that need to fill the viewport with a single quad.


	const _camera = new THREE.OrthographicCamera( - 1, 1, 1, - 1, 0, 1 ); // https://github.com/mrdoob/three.js/pull/21358


	const _geometry = new THREE.BufferGeometry();

	_geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ - 1, 3, 0, - 1, - 1, 0, 3, - 1, 0 ], 3 ) );

	_geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );

	class FullScreenQuad {

		constructor( material ) {

			this._mesh = new THREE.Mesh( _geometry, material );

		}

		dispose() {

			this._mesh.geometry.dispose();

		}

		render( renderer ) {

			renderer.render( this._mesh, _camera );

		}

		get material() {

			return this._mesh.material;

		}

		set material( value ) {

			this._mesh.material = value;

		}

	}

	THREE.EffectComposer = EffectComposer;
	THREE.FullScreenQuad = FullScreenQuad;
	THREE.Pass = Pass;

} )();
( function () {

	class RenderPass extends THREE.Pass {

		constructor( scene, camera, overrideMaterial, clearColor, clearAlpha ) {

			super();
			this.scene = scene;
			this.camera = camera;
			this.overrideMaterial = overrideMaterial;
			this.clearColor = clearColor;
			this.clearAlpha = clearAlpha !== undefined ? clearAlpha : 0;
			this.clear = true;
			this.clearDepth = false;
			this.needsSwap = false;
			this._oldClearColor = new THREE.Color();

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			const oldAutoClear = renderer.autoClear;
			renderer.autoClear = false;
			let oldClearAlpha, oldOverrideMaterial;

			if ( this.overrideMaterial !== undefined ) {

				oldOverrideMaterial = this.scene.overrideMaterial;
				this.scene.overrideMaterial = this.overrideMaterial;

			}

			if ( this.clearColor ) {

				renderer.getClearColor( this._oldClearColor );
				oldClearAlpha = renderer.getClearAlpha();
				renderer.setClearColor( this.clearColor, this.clearAlpha );

			}

			if ( this.clearDepth ) {

				renderer.clearDepth();

			}

			renderer.setRenderTarget( this.renderToScreen ? null : readBuffer ); // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600

			if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
			renderer.render( this.scene, this.camera );

			if ( this.clearColor ) {

				renderer.setClearColor( this._oldClearColor, oldClearAlpha );

			}

			if ( this.overrideMaterial !== undefined ) {

				this.scene.overrideMaterial = oldOverrideMaterial;

			}

			renderer.autoClear = oldAutoClear;

		}

	}

	THREE.RenderPass = RenderPass;

} )();
( function () {

	class ShaderPass extends THREE.Pass {

		constructor( shader, textureID ) {

			super();
			this.textureID = textureID !== undefined ? textureID : 'tDiffuse';

			if ( shader instanceof THREE.ShaderMaterial ) {

				this.uniforms = shader.uniforms;
				this.material = shader;

			} else if ( shader ) {

				this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );
				this.material = new THREE.ShaderMaterial( {
					defines: Object.assign( {}, shader.defines ),
					uniforms: this.uniforms,
					vertexShader: shader.vertexShader,
					fragmentShader: shader.fragmentShader
				} );

			}

			this.fsQuad = new THREE.FullScreenQuad( this.material );

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			if ( this.uniforms[ this.textureID ] ) {

				this.uniforms[ this.textureID ].value = readBuffer.texture;

			}

			this.fsQuad.material = this.material;

			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.fsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( writeBuffer ); // TODO: Avoid using autoClear properties, see https://github.com/mrdoob/three.js/pull/15571#issuecomment-465669600

				if ( this.clear ) renderer.clear( renderer.autoClearColor, renderer.autoClearDepth, renderer.autoClearStencil );
				this.fsQuad.render( renderer );

			}

		}

	}

	THREE.ShaderPass = ShaderPass;

} )();
( function () {

	class MaskPass extends THREE.Pass {

		constructor( scene, camera ) {

			super();
			this.scene = scene;
			this.camera = camera;
			this.clear = true;
			this.needsSwap = false;
			this.inverse = false;

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive */
		) {

			const context = renderer.getContext();
			const state = renderer.state; // don't update color or depth

			state.buffers.color.setMask( false );
			state.buffers.depth.setMask( false ); // lock buffers

			state.buffers.color.setLocked( true );
			state.buffers.depth.setLocked( true ); // set up stencil

			let writeValue, clearValue;

			if ( this.inverse ) {

				writeValue = 0;
				clearValue = 1;

			} else {

				writeValue = 1;
				clearValue = 0;

			}

			state.buffers.stencil.setTest( true );
			state.buffers.stencil.setOp( context.REPLACE, context.REPLACE, context.REPLACE );
			state.buffers.stencil.setFunc( context.ALWAYS, writeValue, 0xffffffff );
			state.buffers.stencil.setClear( clearValue );
			state.buffers.stencil.setLocked( true ); // draw into the stencil buffer

			renderer.setRenderTarget( readBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.scene, this.camera );
			renderer.setRenderTarget( writeBuffer );
			if ( this.clear ) renderer.clear();
			renderer.render( this.scene, this.camera ); // unlock color and depth buffer for subsequent rendering

			state.buffers.color.setLocked( false );
			state.buffers.depth.setLocked( false ); // only render where stencil is set to 1

			state.buffers.stencil.setLocked( false );
			state.buffers.stencil.setFunc( context.EQUAL, 1, 0xffffffff ); // draw if == 1

			state.buffers.stencil.setOp( context.KEEP, context.KEEP, context.KEEP );
			state.buffers.stencil.setLocked( true );

		}

	}

	class ClearMaskPass extends THREE.Pass {

		constructor() {

			super();
			this.needsSwap = false;

		}

		render( renderer
			/*, writeBuffer, readBuffer, deltaTime, maskActive */
		) {

			renderer.state.buffers.stencil.setLocked( false );
			renderer.state.buffers.stencil.setTest( false );

		}

	}

	THREE.ClearMaskPass = ClearMaskPass;
	THREE.MaskPass = MaskPass;

} )();
( function () {

	/**
 * SAO implementation inspired from bhouston previous SAO work
 */

	class SAOPass extends THREE.Pass {

		constructor( scene, camera, depthTexture, useNormals, resolution ) {

			super();
			this.scene = scene;
			this.camera = camera;
			this.clear = true;
			this.needsSwap = false;
			this.supportsDepthTextureExtension = depthTexture !== undefined ? depthTexture : false;
			this.supportsNormalTexture = useNormals !== undefined ? useNormals : false;
			this.originalClearColor = new THREE.Color();
			this._oldClearColor = new THREE.Color();
			this.oldClearAlpha = 1;
			this.params = {
				output: 0,
				saoBias: 0.5,
				saoIntensity: 0.18,
				saoScale: 1,
				saoKernelRadius: 100,
				saoMinResolution: 0,
				saoBlur: true,
				saoBlurRadius: 8,
				saoBlurStdDev: 4,
				saoBlurDepthCutoff: 0.01
			};
			this.resolution = resolution !== undefined ? new THREE.Vector2( resolution.x, resolution.y ) : new THREE.Vector2( 256, 256 );
			this.saoRenderTarget = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, {
				minFilter: THREE.LinearFilter,
				magFilter: THREE.LinearFilter,
				format: THREE.RGBAFormat
			} );
			this.blurIntermediateRenderTarget = this.saoRenderTarget.clone();
			this.beautyRenderTarget = this.saoRenderTarget.clone();
			this.normalRenderTarget = new THREE.WebGLRenderTarget( this.resolution.x, this.resolution.y, {
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter,
				format: THREE.RGBAFormat
			} );
			this.depthRenderTarget = this.normalRenderTarget.clone();

			if ( this.supportsDepthTextureExtension ) {

				const depthTexture = new THREE.DepthTexture();
				depthTexture.type = THREE.UnsignedShortType;
				this.beautyRenderTarget.depthTexture = depthTexture;
				this.beautyRenderTarget.depthBuffer = true;

			}

			this.depthMaterial = new THREE.MeshDepthMaterial();
			this.depthMaterial.depthPacking = THREE.RGBADepthPacking;
			this.depthMaterial.blending = THREE.NoBlending;
			this.normalMaterial = new THREE.MeshNormalMaterial();
			this.normalMaterial.blending = THREE.NoBlending;

			if ( THREE.SAOShader === undefined ) {

				console.error( 'THREE.SAOPass relies on THREE.SAOShader' );

			}

			this.saoMaterial = new THREE.ShaderMaterial( {
				defines: Object.assign( {}, THREE.SAOShader.defines ),
				fragmentShader: THREE.SAOShader.fragmentShader,
				vertexShader: THREE.SAOShader.vertexShader,
				uniforms: THREE.UniformsUtils.clone( THREE.SAOShader.uniforms )
			} );
			this.saoMaterial.extensions.derivatives = true;
			this.saoMaterial.defines[ 'DEPTH_PACKING' ] = this.supportsDepthTextureExtension ? 0 : 1;
			this.saoMaterial.defines[ 'NORMAL_TEXTURE' ] = this.supportsNormalTexture ? 1 : 0;
			this.saoMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
			this.saoMaterial.uniforms[ 'tDepth' ].value = this.supportsDepthTextureExtension ? depthTexture : this.depthRenderTarget.texture;
			this.saoMaterial.uniforms[ 'tNormal' ].value = this.normalRenderTarget.texture;
			this.saoMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
			this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
			this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value = this.camera.projectionMatrix;
			this.saoMaterial.blending = THREE.NoBlending;

			if ( THREE.DepthLimitedBlurShader === undefined ) {

				console.error( 'THREE.SAOPass relies on THREE.DepthLimitedBlurShader' );

			}

			this.vBlurMaterial = new THREE.ShaderMaterial( {
				uniforms: THREE.UniformsUtils.clone( THREE.DepthLimitedBlurShader.uniforms ),
				defines: Object.assign( {}, THREE.DepthLimitedBlurShader.defines ),
				vertexShader: THREE.DepthLimitedBlurShader.vertexShader,
				fragmentShader: THREE.DepthLimitedBlurShader.fragmentShader
			} );
			this.vBlurMaterial.defines[ 'DEPTH_PACKING' ] = this.supportsDepthTextureExtension ? 0 : 1;
			this.vBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
			this.vBlurMaterial.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
			this.vBlurMaterial.uniforms[ 'tDepth' ].value = this.supportsDepthTextureExtension ? depthTexture : this.depthRenderTarget.texture;
			this.vBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
			this.vBlurMaterial.blending = THREE.NoBlending;
			this.hBlurMaterial = new THREE.ShaderMaterial( {
				uniforms: THREE.UniformsUtils.clone( THREE.DepthLimitedBlurShader.uniforms ),
				defines: Object.assign( {}, THREE.DepthLimitedBlurShader.defines ),
				vertexShader: THREE.DepthLimitedBlurShader.vertexShader,
				fragmentShader: THREE.DepthLimitedBlurShader.fragmentShader
			} );
			this.hBlurMaterial.defines[ 'DEPTH_PACKING' ] = this.supportsDepthTextureExtension ? 0 : 1;
			this.hBlurMaterial.defines[ 'PERSPECTIVE_CAMERA' ] = this.camera.isPerspectiveCamera ? 1 : 0;
			this.hBlurMaterial.uniforms[ 'tDiffuse' ].value = this.blurIntermediateRenderTarget.texture;
			this.hBlurMaterial.uniforms[ 'tDepth' ].value = this.supportsDepthTextureExtension ? depthTexture : this.depthRenderTarget.texture;
			this.hBlurMaterial.uniforms[ 'size' ].value.set( this.resolution.x, this.resolution.y );
			this.hBlurMaterial.blending = THREE.NoBlending;

			if ( THREE.CopyShader === undefined ) {

				console.error( 'THREE.SAOPass relies on THREE.CopyShader' );

			}

			this.materialCopy = new THREE.ShaderMaterial( {
				uniforms: THREE.UniformsUtils.clone( THREE.CopyShader.uniforms ),
				vertexShader: THREE.CopyShader.vertexShader,
				fragmentShader: THREE.CopyShader.fragmentShader,
				blending: THREE.NoBlending
			} );
			this.materialCopy.transparent = true;
			this.materialCopy.depthTest = false;
			this.materialCopy.depthWrite = false;
			this.materialCopy.blending = THREE.CustomBlending;
			this.materialCopy.blendSrc = THREE.DstColorFactor;
			this.materialCopy.blendDst = THREE.ZeroFactor;
			this.materialCopy.blendEquation = THREE.AddEquation;
			this.materialCopy.blendSrcAlpha = THREE.DstAlphaFactor;
			this.materialCopy.blendDstAlpha = THREE.ZeroFactor;
			this.materialCopy.blendEquationAlpha = THREE.AddEquation;

			if ( THREE.UnpackDepthRGBAShader === undefined ) {

				console.error( 'THREE.SAOPass relies on THREE.UnpackDepthRGBAShader' );

			}

			this.depthCopy = new THREE.ShaderMaterial( {
				uniforms: THREE.UniformsUtils.clone( THREE.UnpackDepthRGBAShader.uniforms ),
				vertexShader: THREE.UnpackDepthRGBAShader.vertexShader,
				fragmentShader: THREE.UnpackDepthRGBAShader.fragmentShader,
				blending: THREE.NoBlending
			} );
			this.fsQuad = new THREE.FullScreenQuad( null );

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive*/
		) {

			// Rendering readBuffer first when rendering to screen
			if ( this.renderToScreen ) {

				this.materialCopy.blending = THREE.NoBlending;
				this.materialCopy.uniforms[ 'tDiffuse' ].value = readBuffer.texture;
				this.materialCopy.needsUpdate = true;
				this.renderPass( renderer, this.materialCopy, null );

			}

			if ( this.params.output === 1 ) {

				return;

			}

			renderer.getClearColor( this._oldClearColor );
			this.oldClearAlpha = renderer.getClearAlpha();
			const oldAutoClear = renderer.autoClear;
			renderer.autoClear = false;
			renderer.setRenderTarget( this.depthRenderTarget );
			renderer.clear();
			this.saoMaterial.uniforms[ 'bias' ].value = this.params.saoBias;
			this.saoMaterial.uniforms[ 'intensity' ].value = this.params.saoIntensity;
			this.saoMaterial.uniforms[ 'scale' ].value = this.params.saoScale;
			this.saoMaterial.uniforms[ 'kernelRadius' ].value = this.params.saoKernelRadius;
			this.saoMaterial.uniforms[ 'minResolution' ].value = this.params.saoMinResolution;
			this.saoMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
			this.saoMaterial.uniforms[ 'cameraFar' ].value = this.camera.far; // this.saoMaterial.uniforms['randomSeed'].value = Math.random();

			const depthCutoff = this.params.saoBlurDepthCutoff * ( this.camera.far - this.camera.near );
			this.vBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;
			this.hBlurMaterial.uniforms[ 'depthCutoff' ].value = depthCutoff;
			this.vBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
			this.vBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
			this.hBlurMaterial.uniforms[ 'cameraNear' ].value = this.camera.near;
			this.hBlurMaterial.uniforms[ 'cameraFar' ].value = this.camera.far;
			this.params.saoBlurRadius = Math.floor( this.params.saoBlurRadius );

			if ( this.prevStdDev !== this.params.saoBlurStdDev || this.prevNumSamples !== this.params.saoBlurRadius ) {

				THREE.BlurShaderUtils.configure( this.vBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new THREE.Vector2( 0, 1 ) );
				THREE.BlurShaderUtils.configure( this.hBlurMaterial, this.params.saoBlurRadius, this.params.saoBlurStdDev, new THREE.Vector2( 1, 0 ) );
				this.prevStdDev = this.params.saoBlurStdDev;
				this.prevNumSamples = this.params.saoBlurRadius;

			} // Rendering scene to depth texture


			renderer.setClearColor( 0x000000 );
			renderer.setRenderTarget( this.beautyRenderTarget );
			renderer.clear();
			renderer.render( this.scene, this.camera ); // Re-render scene if depth texture extension is not supported

			if ( ! this.supportsDepthTextureExtension ) {

				// Clear rule : far clipping plane in both RGBA and Basic encoding
				this.renderOverride( renderer, this.depthMaterial, this.depthRenderTarget, 0x000000, 1.0 );

			}

			if ( this.supportsNormalTexture ) {

				// Clear rule : default normal is facing the camera
				this.renderOverride( renderer, this.normalMaterial, this.normalRenderTarget, 0x7777ff, 1.0 );

			} // Rendering SAO texture


			this.renderPass( renderer, this.saoMaterial, this.saoRenderTarget, 0xffffff, 1.0 ); // Blurring SAO texture

			if ( this.params.saoBlur ) {

				this.renderPass( renderer, this.vBlurMaterial, this.blurIntermediateRenderTarget, 0xffffff, 1.0 );
				this.renderPass( renderer, this.hBlurMaterial, this.saoRenderTarget, 0xffffff, 1.0 );

			}

			let outputMaterial = this.materialCopy; // Setting up SAO rendering

			if ( this.params.output === 3 ) {

				if ( this.supportsDepthTextureExtension ) {

					this.materialCopy.uniforms[ 'tDiffuse' ].value = this.beautyRenderTarget.depthTexture;
					this.materialCopy.needsUpdate = true;

				} else {

					this.depthCopy.uniforms[ 'tDiffuse' ].value = this.depthRenderTarget.texture;
					this.depthCopy.needsUpdate = true;
					outputMaterial = this.depthCopy;

				}

			} else if ( this.params.output === 4 ) {

				this.materialCopy.uniforms[ 'tDiffuse' ].value = this.normalRenderTarget.texture;
				this.materialCopy.needsUpdate = true;

			} else {

				this.materialCopy.uniforms[ 'tDiffuse' ].value = this.saoRenderTarget.texture;
				this.materialCopy.needsUpdate = true;

			} // Blending depends on output, only want a THREE.CustomBlending when showing SAO


			if ( this.params.output === 0 ) {

				outputMaterial.blending = THREE.CustomBlending;

			} else {

				outputMaterial.blending = THREE.NoBlending;

			} // Rendering SAOPass result on top of previous pass


			this.renderPass( renderer, outputMaterial, this.renderToScreen ? null : readBuffer );
			renderer.setClearColor( this._oldClearColor, this.oldClearAlpha );
			renderer.autoClear = oldAutoClear;

		}

		renderPass( renderer, passMaterial, renderTarget, clearColor, clearAlpha ) {

			// save original state
			renderer.getClearColor( this.originalClearColor );
			const originalClearAlpha = renderer.getClearAlpha();
			const originalAutoClear = renderer.autoClear;
			renderer.setRenderTarget( renderTarget ); // setup pass state

			renderer.autoClear = false;

			if ( clearColor !== undefined && clearColor !== null ) {

				renderer.setClearColor( clearColor );
				renderer.setClearAlpha( clearAlpha || 0.0 );
				renderer.clear();

			}

			this.fsQuad.material = passMaterial;
			this.fsQuad.render( renderer ); // restore original state

			renderer.autoClear = originalAutoClear;
			renderer.setClearColor( this.originalClearColor );
			renderer.setClearAlpha( originalClearAlpha );

		}

		renderOverride( renderer, overrideMaterial, renderTarget, clearColor, clearAlpha ) {

			renderer.getClearColor( this.originalClearColor );
			const originalClearAlpha = renderer.getClearAlpha();
			const originalAutoClear = renderer.autoClear;
			renderer.setRenderTarget( renderTarget );
			renderer.autoClear = false;
			clearColor = overrideMaterial.clearColor || clearColor;
			clearAlpha = overrideMaterial.clearAlpha || clearAlpha;

			if ( clearColor !== undefined && clearColor !== null ) {

				renderer.setClearColor( clearColor );
				renderer.setClearAlpha( clearAlpha || 0.0 );
				renderer.clear();

			}

			this.scene.overrideMaterial = overrideMaterial;
			renderer.render( this.scene, this.camera );
			this.scene.overrideMaterial = null; // restore original state

			renderer.autoClear = originalAutoClear;
			renderer.setClearColor( this.originalClearColor );
			renderer.setClearAlpha( originalClearAlpha );

		}

		setSize( width, height ) {

			this.beautyRenderTarget.setSize( width, height );
			this.saoRenderTarget.setSize( width, height );
			this.blurIntermediateRenderTarget.setSize( width, height );
			this.normalRenderTarget.setSize( width, height );
			this.depthRenderTarget.setSize( width, height );
			this.saoMaterial.uniforms[ 'size' ].value.set( width, height );
			this.saoMaterial.uniforms[ 'cameraInverseProjectionMatrix' ].value.copy( this.camera.projectionMatrixInverse );
			this.saoMaterial.uniforms[ 'cameraProjectionMatrix' ].value = this.camera.projectionMatrix;
			this.saoMaterial.needsUpdate = true;
			this.vBlurMaterial.uniforms[ 'size' ].value.set( width, height );
			this.vBlurMaterial.needsUpdate = true;
			this.hBlurMaterial.uniforms[ 'size' ].value.set( width, height );
			this.hBlurMaterial.needsUpdate = true;

		}

	}

	SAOPass.OUTPUT = {
		'Beauty': 1,
		'Default': 0,
		'SAO': 2,
		'Depth': 3,
		'Normal': 4
	};

	THREE.SAOPass = SAOPass;

} )();
( function () {

	/**
 * Depth-of-field post-process with bokeh shader
 */

	class BokehPass extends THREE.Pass {

		constructor( scene, camera, params ) {

			super();
			this.scene = scene;
			this.camera = camera;
			const focus = params.focus !== undefined ? params.focus : 1.0;
			const aspect = params.aspect !== undefined ? params.aspect : camera.aspect;
			const aperture = params.aperture !== undefined ? params.aperture : 0.025;
			const maxblur = params.maxblur !== undefined ? params.maxblur : 1.0; // render targets

			const width = params.width || window.innerWidth || 1;
			const height = params.height || window.innerHeight || 1;
			this.renderTargetDepth = new THREE.WebGLRenderTarget( width, height, {
				minFilter: THREE.NearestFilter,
				magFilter: THREE.NearestFilter
			} );
			this.renderTargetDepth.texture.name = 'BokehPass.depth'; // depth material

			this.materialDepth = new THREE.MeshDepthMaterial();
			this.materialDepth.depthPacking = THREE.RGBADepthPacking;
			this.materialDepth.blending = THREE.NoBlending; // bokeh material

			if ( THREE.BokehShader === undefined ) {

				console.error( 'THREE.BokehPass relies on THREE.BokehShader' );

			}

			const bokehShader = THREE.BokehShader;
			const bokehUniforms = THREE.UniformsUtils.clone( bokehShader.uniforms );
			bokehUniforms[ 'tDepth' ].value = this.renderTargetDepth.texture;
			bokehUniforms[ 'focus' ].value = focus;
			bokehUniforms[ 'aspect' ].value = aspect;
			bokehUniforms[ 'aperture' ].value = aperture;
			bokehUniforms[ 'maxblur' ].value = maxblur;
			bokehUniforms[ 'nearClip' ].value = camera.near;
			bokehUniforms[ 'farClip' ].value = camera.far;
			this.materialBokeh = new THREE.ShaderMaterial( {
				defines: Object.assign( {}, bokehShader.defines ),
				uniforms: bokehUniforms,
				vertexShader: bokehShader.vertexShader,
				fragmentShader: bokehShader.fragmentShader
			} );
			this.uniforms = bokehUniforms;
			this.needsSwap = false;
			this.fsQuad = new THREE.FullScreenQuad( this.materialBokeh );
			this._oldClearColor = new THREE.Color();

		}

		render( renderer, writeBuffer, readBuffer
			/*, deltaTime, maskActive*/
		) {

			// Render depth into texture
			this.scene.overrideMaterial = this.materialDepth;
			renderer.getClearColor( this._oldClearColor );
			const oldClearAlpha = renderer.getClearAlpha();
			const oldAutoClear = renderer.autoClear;
			renderer.autoClear = false;
			renderer.setClearColor( 0xffffff );
			renderer.setClearAlpha( 1.0 );
			renderer.setRenderTarget( this.renderTargetDepth );
			renderer.clear();
			renderer.render( this.scene, this.camera ); // Render bokeh composite

			this.uniforms[ 'tColor' ].value = readBuffer.texture;
			this.uniforms[ 'nearClip' ].value = this.camera.near;
			this.uniforms[ 'farClip' ].value = this.camera.far;

			if ( this.renderToScreen ) {

				renderer.setRenderTarget( null );
				this.fsQuad.render( renderer );

			} else {

				renderer.setRenderTarget( writeBuffer );
				renderer.clear();
				this.fsQuad.render( renderer );

			}

			this.scene.overrideMaterial = null;
			renderer.setClearColor( this._oldClearColor );
			renderer.setClearAlpha( oldClearAlpha );
			renderer.autoClear = oldAutoClear;

		}

	}

	THREE.BokehPass = BokehPass;

} )();
( function () {

	// http://en.wikipedia.org/wiki/RGBE_image_format

	class RGBELoader extends THREE.DataTextureLoader {

		constructor( manager ) {

			super( manager );
			this.type = THREE.UnsignedByteType;

		} // adapted from http://www.graphics.cornell.edu/~bjw/rgbe.html


		parse( buffer ) {

			const
				/* return codes for rgbe routines */
				//RGBE_RETURN_SUCCESS = 0,
				RGBE_RETURN_FAILURE = - 1,

				/* default error routine.  change this to change error handling */
				rgbe_read_error = 1,
				rgbe_write_error = 2,
				rgbe_format_error = 3,
				rgbe_memory_error = 4,
				rgbe_error = function ( rgbe_error_code, msg ) {

					switch ( rgbe_error_code ) {

						case rgbe_read_error:
							console.error( 'THREE.RGBELoader Read Error: ' + ( msg || '' ) );
							break;

						case rgbe_write_error:
							console.error( 'THREE.RGBELoader Write Error: ' + ( msg || '' ) );
							break;

						case rgbe_format_error:
							console.error( 'THREE.RGBELoader Bad File Format: ' + ( msg || '' ) );
							break;

						default:
						case rgbe_memory_error:
							console.error( 'THREE.RGBELoader: Error: ' + ( msg || '' ) );

					}

					return RGBE_RETURN_FAILURE;

				},

				/* offsets to red, green, and blue components in a data (float) pixel */
				//RGBE_DATA_RED = 0,
				//RGBE_DATA_GREEN = 1,
				//RGBE_DATA_BLUE = 2,

				/* number of floats per pixel, use 4 since stored in rgba image format */
				//RGBE_DATA_SIZE = 4,

				/* flags indicating which fields in an rgbe_header_info are valid */
				RGBE_VALID_PROGRAMTYPE = 1,
				RGBE_VALID_FORMAT = 2,
				RGBE_VALID_DIMENSIONS = 4,
				NEWLINE = '\n',
				fgets = function ( buffer, lineLimit, consume ) {

					const chunkSize = 128;
					lineLimit = ! lineLimit ? 1024 : lineLimit;
					let p = buffer.pos,
						i = - 1,
						len = 0,
						s = '',
						chunk = String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) );

					while ( 0 > ( i = chunk.indexOf( NEWLINE ) ) && len < lineLimit && p < buffer.byteLength ) {

						s += chunk;
						len += chunk.length;
						p += chunkSize;
						chunk += String.fromCharCode.apply( null, new Uint16Array( buffer.subarray( p, p + chunkSize ) ) );

					}

					if ( - 1 < i ) {

						/*for (i=l-1; i>=0; i--) {
        	byteCode = m.charCodeAt(i);
        	if (byteCode > 0x7f && byteCode <= 0x7ff) byteLen++;
        	else if (byteCode > 0x7ff && byteCode <= 0xffff) byteLen += 2;
        	if (byteCode >= 0xDC00 && byteCode <= 0xDFFF) i--; //trail surrogate
        }*/
						if ( false !== consume ) buffer.pos += len + i + 1;
						return s + chunk.slice( 0, i );

					}

					return false;

				},

				/* minimal header reading.  modify if you want to parse more information */
				RGBE_ReadHeader = function ( buffer ) {

					// regexes to parse header info fields
					const magic_token_re = /^#\?(\S+)/,
						gamma_re = /^\s*GAMMA\s*=\s*(\d+(\.\d+)?)\s*$/,
						exposure_re = /^\s*EXPOSURE\s*=\s*(\d+(\.\d+)?)\s*$/,
						format_re = /^\s*FORMAT=(\S+)\s*$/,
						dimensions_re = /^\s*\-Y\s+(\d+)\s+\+X\s+(\d+)\s*$/,
						// RGBE format header struct
						header = {
							valid: 0,

							/* indicate which fields are valid */
							string: '',

							/* the actual header string */
							comments: '',

							/* comments found in header */
							programtype: 'RGBE',

							/* listed at beginning of file to identify it after "#?". defaults to "RGBE" */
							format: '',

							/* RGBE format, default 32-bit_rle_rgbe */
							gamma: 1.0,

							/* image has already been gamma corrected with given gamma. defaults to 1.0 (no correction) */
							exposure: 1.0,

							/* a value of 1.0 in an image corresponds to <exposure> watts/steradian/m^2. defaults to 1.0 */
							width: 0,
							height: 0
							/* image dimensions, width/height */

						};
					let line, match;

					if ( buffer.pos >= buffer.byteLength || ! ( line = fgets( buffer ) ) ) {

						return rgbe_error( rgbe_read_error, 'no header found' );

					}
					/* if you want to require the magic token then uncomment the next line */


					if ( ! ( match = line.match( magic_token_re ) ) ) {

						return rgbe_error( rgbe_format_error, 'bad initial token' );

					}

					header.valid |= RGBE_VALID_PROGRAMTYPE;
					header.programtype = match[ 1 ];
					header.string += line + '\n';

					while ( true ) {

						line = fgets( buffer );
						if ( false === line ) break;
						header.string += line + '\n';

						if ( '#' === line.charAt( 0 ) ) {

							header.comments += line + '\n';
							continue; // comment line

						}

						if ( match = line.match( gamma_re ) ) {

							header.gamma = parseFloat( match[ 1 ], 10 );

						}

						if ( match = line.match( exposure_re ) ) {

							header.exposure = parseFloat( match[ 1 ], 10 );

						}

						if ( match = line.match( format_re ) ) {

							header.valid |= RGBE_VALID_FORMAT;
							header.format = match[ 1 ]; //'32-bit_rle_rgbe';

						}

						if ( match = line.match( dimensions_re ) ) {

							header.valid |= RGBE_VALID_DIMENSIONS;
							header.height = parseInt( match[ 1 ], 10 );
							header.width = parseInt( match[ 2 ], 10 );

						}

						if ( header.valid & RGBE_VALID_FORMAT && header.valid & RGBE_VALID_DIMENSIONS ) break;

					}

					if ( ! ( header.valid & RGBE_VALID_FORMAT ) ) {

						return rgbe_error( rgbe_format_error, 'missing format specifier' );

					}

					if ( ! ( header.valid & RGBE_VALID_DIMENSIONS ) ) {

						return rgbe_error( rgbe_format_error, 'missing image size specifier' );

					}

					return header;

				},
				RGBE_ReadPixels_RLE = function ( buffer, w, h ) {

					const scanline_width = w;

					if ( // run length encoding is not allowed so read flat
						scanline_width < 8 || scanline_width > 0x7fff || // this file is not run length encoded
      2 !== buffer[ 0 ] || 2 !== buffer[ 1 ] || buffer[ 2 ] & 0x80 ) {

						// return the flat buffer
						return new Uint8Array( buffer );

					}

					if ( scanline_width !== ( buffer[ 2 ] << 8 | buffer[ 3 ] ) ) {

						return rgbe_error( rgbe_format_error, 'wrong scanline width' );

					}

					const data_rgba = new Uint8Array( 4 * w * h );

					if ( ! data_rgba.length ) {

						return rgbe_error( rgbe_memory_error, 'unable to allocate buffer space' );

					}

					let offset = 0,
						pos = 0;
					const ptr_end = 4 * scanline_width;
					const rgbeStart = new Uint8Array( 4 );
					const scanline_buffer = new Uint8Array( ptr_end );
					let num_scanlines = h; // read in each successive scanline

					while ( num_scanlines > 0 && pos < buffer.byteLength ) {

						if ( pos + 4 > buffer.byteLength ) {

							return rgbe_error( rgbe_read_error );

						}

						rgbeStart[ 0 ] = buffer[ pos ++ ];
						rgbeStart[ 1 ] = buffer[ pos ++ ];
						rgbeStart[ 2 ] = buffer[ pos ++ ];
						rgbeStart[ 3 ] = buffer[ pos ++ ];

						if ( 2 != rgbeStart[ 0 ] || 2 != rgbeStart[ 1 ] || ( rgbeStart[ 2 ] << 8 | rgbeStart[ 3 ] ) != scanline_width ) {

							return rgbe_error( rgbe_format_error, 'bad rgbe scanline format' );

						} // read each of the four channels for the scanline into the buffer
						// first red, then green, then blue, then exponent


						let ptr = 0,
							count;

						while ( ptr < ptr_end && pos < buffer.byteLength ) {

							count = buffer[ pos ++ ];
							const isEncodedRun = count > 128;
							if ( isEncodedRun ) count -= 128;

							if ( 0 === count || ptr + count > ptr_end ) {

								return rgbe_error( rgbe_format_error, 'bad scanline data' );

							}

							if ( isEncodedRun ) {

								// a (encoded) run of the same value
								const byteValue = buffer[ pos ++ ];

								for ( let i = 0; i < count; i ++ ) {

									scanline_buffer[ ptr ++ ] = byteValue;

								} //ptr += count;

							} else {

								// a literal-run
								scanline_buffer.set( buffer.subarray( pos, pos + count ), ptr );
								ptr += count;
								pos += count;

							}

						} // now convert data from buffer into rgba
						// first red, then green, then blue, then exponent (alpha)


						const l = scanline_width; //scanline_buffer.byteLength;

						for ( let i = 0; i < l; i ++ ) {

							let off = 0;
							data_rgba[ offset ] = scanline_buffer[ i + off ];
							off += scanline_width; //1;

							data_rgba[ offset + 1 ] = scanline_buffer[ i + off ];
							off += scanline_width; //1;

							data_rgba[ offset + 2 ] = scanline_buffer[ i + off ];
							off += scanline_width; //1;

							data_rgba[ offset + 3 ] = scanline_buffer[ i + off ];
							offset += 4;

						}

						num_scanlines --;

					}

					return data_rgba;

				};

			const RGBEByteToRGBFloat = function ( sourceArray, sourceOffset, destArray, destOffset ) {

				const e = sourceArray[ sourceOffset + 3 ];
				const scale = Math.pow( 2.0, e - 128.0 ) / 255.0;
				destArray[ destOffset + 0 ] = sourceArray[ sourceOffset + 0 ] * scale;
				destArray[ destOffset + 1 ] = sourceArray[ sourceOffset + 1 ] * scale;
				destArray[ destOffset + 2 ] = sourceArray[ sourceOffset + 2 ] * scale;

			};

			const RGBEByteToRGBHalf = function ( sourceArray, sourceOffset, destArray, destOffset ) {

				const e = sourceArray[ sourceOffset + 3 ];
				const scale = Math.pow( 2.0, e - 128.0 ) / 255.0;
				destArray[ destOffset + 0 ] = THREE.DataUtils.toHalfFloat( sourceArray[ sourceOffset + 0 ] * scale );
				destArray[ destOffset + 1 ] = THREE.DataUtils.toHalfFloat( sourceArray[ sourceOffset + 1 ] * scale );
				destArray[ destOffset + 2 ] = THREE.DataUtils.toHalfFloat( sourceArray[ sourceOffset + 2 ] * scale );

			};

			const byteArray = new Uint8Array( buffer );
			byteArray.pos = 0;
			const rgbe_header_info = RGBE_ReadHeader( byteArray );

			if ( RGBE_RETURN_FAILURE !== rgbe_header_info ) {

				const w = rgbe_header_info.width,
					h = rgbe_header_info.height,
					image_rgba_data = RGBE_ReadPixels_RLE( byteArray.subarray( byteArray.pos ), w, h );

				if ( RGBE_RETURN_FAILURE !== image_rgba_data ) {

					let data, format, type;
					let numElements;

					switch ( this.type ) {

						case THREE.UnsignedByteType:
							data = image_rgba_data;
							format = THREE.RGBEFormat; // handled as THREE.RGBAFormat in shaders

							type = THREE.UnsignedByteType;
							break;

						case THREE.FloatType:
							numElements = image_rgba_data.length / 4 * 3;
							const floatArray = new Float32Array( numElements );

							for ( let j = 0; j < numElements; j ++ ) {

								RGBEByteToRGBFloat( image_rgba_data, j * 4, floatArray, j * 3 );

							}

							data = floatArray;
							format = THREE.RGBFormat;
							type = THREE.FloatType;
							break;

						case THREE.HalfFloatType:
							numElements = image_rgba_data.length / 4 * 3;
							const halfArray = new Uint16Array( numElements );

							for ( let j = 0; j < numElements; j ++ ) {

								RGBEByteToRGBHalf( image_rgba_data, j * 4, halfArray, j * 3 );

							}

							data = halfArray;
							format = THREE.RGBFormat;
							type = THREE.HalfFloatType;
							break;

						default:
							console.error( 'THREE.RGBELoader: unsupported type: ', this.type );
							break;

					}

					return {
						width: w,
						height: h,
						data: data,
						header: rgbe_header_info.string,
						gamma: rgbe_header_info.gamma,
						exposure: rgbe_header_info.exposure,
						format: format,
						type: type
					};

				}

			}

			return null;

		}

		setDataType( value ) {

			this.type = value;
			return this;

		}

		load( url, onLoad, onProgress, onError ) {

			function onLoadCallback( texture, texData ) {

				switch ( texture.type ) {

					case THREE.UnsignedByteType:
						texture.encoding = THREE.RGBEEncoding;
						texture.minFilter = THREE.NearestFilter;
						texture.magFilter = THREE.NearestFilter;
						texture.generateMipmaps = false;
						texture.flipY = true;
						break;

					case THREE.FloatType:
						texture.encoding = THREE.LinearEncoding;
						texture.minFilter = THREE.LinearFilter;
						texture.magFilter = THREE.LinearFilter;
						texture.generateMipmaps = false;
						texture.flipY = true;
						break;

					case THREE.HalfFloatType:
						texture.encoding = THREE.LinearEncoding;
						texture.minFilter = THREE.LinearFilter;
						texture.magFilter = THREE.LinearFilter;
						texture.generateMipmaps = false;
						texture.flipY = true;
						break;

				}

				if ( onLoad ) onLoad( texture, texData );

			}

			return super.load( url, onLoadCallback, onProgress, onError );

		}

	}

	THREE.RGBELoader = RGBELoader;

} )();
