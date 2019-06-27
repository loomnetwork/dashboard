<template>
  <div id="feedback-form">
    <b-card class="mb-4 form-contianer" no-body>
      <iframe title="Feedback Form" 
        class="freshwidget-embedded-form"
        id="freshwidget-embedded-form" 
        src="https://loom.freshdesk.com/widgets/feedback_widget/new?&widgetType=embedded&formTitle=Contact+Support&submitTitle=Send+to+Support&submitThanks=Thanks!+Your+message+has+been+added+to+our+support+queue.+One+of+our+agents+will+get+back+to+you+within+the+next+2+work+days.&searchArea=no&captcha=yes" 
        scrolling="no"
        height="1100px"
        width="100%"
        frameborder="0">
      </iframe>
    </b-card>
  </div>
</template>

<script>
export default {

}
</script>

<style>
#feedback-form {
  padding-top: 2rem;
}
.form-contianer {
  padding: 1.5em;
}
.to-right {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
h4 {
  margin-bottom: 1.5rem;
}
</style>
