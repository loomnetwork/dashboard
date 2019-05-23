<template>
  <div id="feedback-form">
    <b-card class="mb-4 form-contianer" no-body>
      <!-- For Enabling CAPTCHA: add "&captcha=yes" in src property -->
      <iframe title="Feedback Form" 
        class="freshwidget-embedded-form"
        id="freshwidget-embedded-form" 
        src="https://loom.freshdesk.com/widgets/feedback_widget/new?&widgetType=embedded&formTitle=Contact+Support&submitTitle=Send+to+Support&submitThanks=Thanks!+Your+message+has+been+added+to+our+support+queue.+One+of+our+agents+will+get+back+to+you+within+the+next+2+work+days.&searchArea=no&captcha=yes" 
        scrolling="no"
        height="1100px"
        width="100%"
        frameborder="0" >
      </iframe>
    </b-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        email: '',
        title: '',
        ethAddress: '',
        catSelected: null,
        walletSelected: null,
        platformSelected: null,
        categories: [
          {text: 'Select One', value: null, disabled: true},
          {text: 'Deposit', value: 'Deposit'},
          {text: 'Withdraw', value: 'Withdraw'},
          {text: 'Delegate', value: 'Delegate'},
          {text: 'Re-delegate', value: 'Re-delegate'},
          {text: 'Undelegate', value: 'Undelegate'},
          {text: 'Rewards', value: 'Rewards'},
          {text: 'Other', value: 'Other'}
        ],
        wallets: [
          {text: 'Select One', value: null, disabled: true},
          {text: 'MetaMask', value: 'MetaMask'},
          {text: 'Ledger', value: 'Ledger'},
          {text: 'Cobo', value: 'Cobo'},
          {text: 'imToken', value: 'imToken'},
          {text: 'Trust Wallet', value: 'Trust Wallet'},
          {text: 'Trezor', value: 'Trezor'}
        ],
        platforms: [
          {text: 'Select One', value: null, disabled: true},
          {text: 'Android', value: 'Android'},
          {text: 'iOS', value: 'iOS'},
          {text: 'Windows', value: 'Windows'},
          {text: 'macOS', value: 'macOS'}
        ],
        browser: '',
        errorMsg: '',
        additionalContext: '',
        file: null
      }
    }
  },
  methods: {
    onSubmit() {
      console.log('onSubmit')
      console.log(this.form)
    }
  },
  computed: {
    fileName() {
      return this.form.file ? this.form.file.name : ''
    }
  }
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
