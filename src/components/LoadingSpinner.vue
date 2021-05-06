<template>
  <div class="loading-backdrop" :class="[showBackdrop ? 'with-backdrop' : '']">
    <div class="gif-container">
      <img
        src="@/assets/loomy-running.gif"
        class="looping-loomy mb-2"
        alt="loomy"
      />
      <h6 class="loading-text">
        {{ $t("components.loading_spinner.please_be_patient_loomy_is") }}
      </h6>
      <small>{{
        message ||
        $t("components.loading_spinner.this_could_take_several_minutes")
      }}</small>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { Component } from "vue-property-decorator"

@Component({
  props: {
    showBackdrop: Boolean,
    message: String,
  },
})
export default class LoadingSpinner extends Vue {
  loading: boolean = true
}
</script>
<style scoped lang="scss">
.loading-backdrop {
  position: absolute;
  display: flex;
  align-content: center;
  justify-content: center;
  top: 0px;
  left: 0px;
  bottom: 0px;
  right: 0px;
  z-index: 9999;
}

.with-backdrop {
  position: fixed !important;
  width: 100vw;
  height: 100vh;
  background-color: rgb(255, 255, 255);
}

@keyframes lds-dual-ring {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@-webkit-keyframes lds-dual-ring {
  0% {
    -webkit-transform: rotate(0);
    transform: rotate(0);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
.lds-css {
  display: flex;
  align-items: center;
  justify-content: center;
}
.lds-dual-ring {
  position: relative;
}
.lds-dual-ring div {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: 8px solid #000;
  border-color: #5756e6 transparent #5756e6 transparent;
  -webkit-animation: lds-dual-ring 0.8s linear infinite;
  animation: lds-dual-ring 0.8s linear infinite;
}
.lds-dual-ring {
  width: 60px !important;
  height: 60px !important;
  -webkit-transform: translate(-100px, -100px) scale(1) translate(100px, 100px);
  transform: translate(-100px, -100px) scale(1) translate(100px, 100px);
}

.gif-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  padding: 24px;
}

.looping-loomy {
  width: 96px;
  height: auto;
}

.loading-text {
  color: #5756e6;
  font-style: italic;
}
</style></div>


</style>