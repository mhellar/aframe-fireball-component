/*
  A-Frame Fireball Component 
  Copyright (C) 2017, Uri Shaked
  Licensed under the MIT license

  based on: http://shaderfrog.com/view/76
  and: http://alteredqualia.com/three/examples/webgl_shader_fireball.html
*/

if (typeof AFRAME === 'undefined') {
    throw new Error('Component attempted to register before AFRAME was available.');
}

// based on http://shaderfrog.com/view/76
var vertexShader = "\nprecision highp float;\nprecision highp int;\n\nattribute vec2 uv2;\n\nuniform float speed;\nuniform float time;\nuniform float scale;\n\nvarying vec3 vTexCoord3D;\nvarying vec3 vNormal;\nvarying vec3 vViewPosition;\nvarying vec3 vPosition;\n\nvoid main( void ) {\n  vPosition = position;\n  vec4 mPosition = modelMatrix * vec4( position, 1.0 );\n  vNormal = normalize( normalMatrix * normal );\n  vViewPosition = cameraPosition - mPosition.xyz;\n\n  vTexCoord3D = scale * ( position.xyz + cameraPosition * speed * time );\n  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}\n";

var fragmentShader = "#ifdef GL_ES
precision mediump float;#
endif

uniform float time;
uniform vec2 mouse;
uniform vec2 resolution;
varying vec2 surfacePosition;

vec3 getColor(float phase);

#
define stripes 2.# define k 4.# define sx surfacePosition.x# define sy surfacePosition.y

float PI = 4. * atan(1.);

void main(void) {
    vec3 c = getColor(time * 0.7 * PI);
    gl_FragColor = vec4(c, 1.0);

}

vec3 getColor(float phase) {
    float x = sx * 2.3;
    float y = sy * 2.3;
    float theta = atan(y, x) * 3.;
    float r = log(x * x + y * y); //(mouse.x*2.);
    float c = 0.;
    float tt;
    for (float t = 0.; t < k; t++) {
        float tt = t * PI;
        c += cos((theta * cos(tt) * t - time + c + r * sin(t + c * 0.05) * t) * stripes + phase);
    }
    //c = (c+k) / (k*2.);
    //c = c > 0.5 ? 1. : 0.;
    c /= 3.;
    return vec3((c), c * c, -c);
    //return vec3(c, c, c);

}
"
AFRAME.registerComponent('fireball', {
    schema: {
        brightness: {
            type: 'float',
            default: 1.5
        },
        color: {
            type: 'color',
            default: '#ffaa55'
        },
        scale: {
            type: 'float',
            default: 1
        },
        opacity: {
            type: 'float',
            default: 1
        },
        speed: {
            type: 'float',
            default: 0.1
        }
    },

    init: function() {
        var this$1 = this;

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                speed: { value: this.data.speed },
                time: { value: 0.0 },
                color: { value: new THREE.Color(this.data.color) },
                brightness: { value: this.data.brightness },
                opacity: { value: this.data.opacity },
                scale: { value: this.data.scale },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            transparent: this.data.opacity < 1,
        });

        this.applyToMesh();
        this.el.addEventListener('model-loaded', function() { return this$1.applyToMesh(); });
    },

    update: function() {
        var data = this.data;
        var uniforms = this.material.uniforms;
        uniforms.brightness.value = data.brightness;
        uniforms.color.value.set(data.color);
        uniforms.scale.value = data.scale;
        uniforms.speed.value = data.speed;
        uniforms.opacity.value = data.opacity;
        this.material.transparent = data.opacity < 1;
    },

    applyToMesh: function() {
        var mesh = this.el.getObject3D('mesh');
        if (mesh) {
            mesh.material = this.material;
        }
    },

    tick: function(t) {
        this.material.uniforms.time.value = t / 1000;
    }
});