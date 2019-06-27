<template>
  <svg class="wrapper" :width="width || '24px'" :height="height || '21px'" viewBox="0 0 24 21" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <!-- Generator: Sketch 48.2 (47327) - http://www.bohemiancoding.com/sketch -->
      <title>logo_svg_22x19</title>
      <desc>Created with Sketch.</desc>
      <defs></defs>
      <g id="DelegateCall--Index-1-Copy-5" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" transform="translate(-30.000000, -856.000000)">
          <g id="logo_svg_22x19" transform="translate(31.000000, 857.000000)" :stroke="color" stroke-width="2">
              <path d="M16.7877572,18.9529222 L1.29912256,7.77272614 C0.0498187179,6.87090915 -0.257172949,5.09062157 0.613216154,3.79638627 C0.775043077,3.55584379 0.971752692,3.34249739 1.19627256,3.16379804 L4.92044949,0.201288235 L19.9910912,11.040602 C21.4594008,12.0966542 21.8233315,14.185785 20.8039418,15.7069026 C20.5959642,16.0172359 20.3388392,16.2889484 20.0434751,16.5104908 L16.7877572,18.9529222 Z" id="Stroke-1"></path>
              <path d="M8.63647513,5.78952353 L1.41012385,11.160066 C-0.0422428205,12.2394647 -0.375006923,14.3343078 0.666918718,15.8390333 C0.894195641,16.1671248 1.17685333,16.4502621 1.50146615,16.6742882 L4.80057769,18.9529222 L8.74615782,16.130615" id="Stroke-3"></path>
              <path d="M12.8319879,13.1163209 L20.2450995,7.76639281 C21.5488251,6.82558235 21.8694822,4.96792876 20.9612136,3.61731438 C20.7876392,3.35913791 20.5757059,3.13101373 20.3332053,2.94163464 L16.6678854,0.0771052288 L12.8319879,2.93331438" id="Stroke-5"></path>
          </g>
      </g>
  </svg>
</template>

<script lang="ts">
import Vue from "vue"
import { Component, Watch } from "vue-property-decorator"

@Component({
  props: {
    color: String,
    width: String,
    height: String,
  },
})
export default class LoomIcon extends Vue {

}
</script>
<style scoped lang="scss">
  .wrapper {
    position: relative;
    top: -2px;
  }
</style>