<template>
  <div id="feedback-form">
    <b-card>
      {{ $t('views.feedback.take_a_look') }} <router-link to="/staking-guide">Staking Guide</router-link>.
      {{ $t('views.feedback.other_questions') }} <a place="email" href="mailto:support@loomx.io" target="_blank" class="hover-warning"><fa :icon="['fas', 'envelope']" fixed-width /> support@loomx.io </a>
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
