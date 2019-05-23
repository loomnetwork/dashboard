<template>
  <div>
    <div><small><span>Event: </span><strong>{{event.type}}</strong></small></div>
    <div><small><span>ETA: </span><strong>{{formatTime}}</strong></h6></small></div>
  </div>
</template>

<script>
import Vue from 'vue'
import { Component } from 'vue-property-decorator'

@Component({
  props: {
    event: Object
  }
})

export default class FaucetFooter extends Vue {


 get formatTime() {

  if(!this.event.timestamp) return ""
  var date = new Date(this.event.timestamp)
  var hours = date.getHours()
  var minutes = date.getMinutes()
  var ampm = hours >= 12 ? 'pm' : 'am'
  hours = hours % 12
  hours = hours ? hours : 12
  minutes = minutes < 10 ? '0' + minutes : minutes
  var strTime = hours + ':' + minutes + ' ' + ampm
  return strTime

}

}</script>

<style lang="scss">

</style>
