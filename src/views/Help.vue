<template>
  <div class="faucet-with-navbar">
    <div class="faucet-content">
      <div>
        <h1 class="page-header">Help</h1>
      </div>
      <div class="help-block">
        <h3 class="question">What are gateways?</h3>
        <p>Gateways is ...</p>
      </div>
      <div class="help-block">
        <h3 class="question">Questions</h3>
        <p>Answer</p>
      </div>
      <div class="help-block">
        <h3 class="question">Questions</h3>
        <p>Answer</p>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/assets/scss/_mixin.scss';
@import '~@/assets/scss/_variables.scss';

.page-header {
  margin-top: 24px;
  margin-bottom: 32px;
}

.question {
  color: gray
}

.help-block{
  margin: 10px 0px 10px 0px;
  padding: 2px;
}

</style>

