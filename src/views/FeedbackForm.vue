<template>
  <div id="feedback-form">
    <b-card class="mb-4 form-contianer" no-body>
      <h4>Feedback Form</h4>
      <b-form>
        <b-form-group label="Email address:" label-for="email-input">
          <b-form-input id="email-input" v-model="form.email" type="email" placeholder="Your email address"></b-form-input>
        </b-form-group>
        <b-form-group label="Title:" label-for="input-2">
          <b-form-input id="title-input" v-model="form.title" placeholder="Title"></b-form-input>
        </b-form-group>
        <b-row class="my-1">
          <b-col sm="6">
            <b-form-group label="Category:" label-for="input-3">
              <b-form-select id="input-3" :options="form.categories" v-model="form.catSelected"></b-form-select>
            </b-form-group>
          </b-col>
          <b-col sm="6">
            <b-form-group label="Wallet:" label-for="input-3">
              <b-form-select id="input-3" :options="form.wallets" v-model="form.walletSelected"></b-form-select>
            </b-form-group>
          </b-col>
        </b-row>
        <b-form-group label="Eth Address:" label-for="input-4">
          <b-form-input id="eth-addrs-input" placeholder="Eth Address" v-model="form.ethAddress"></b-form-input>
        </b-form-group>
        <b-row class="my-1">
          <b-col sm="6">
            <b-form-group label="Platform:" label-for="input-5">
          <b-form-select id="input-3" :options="form.platforms" v-model="form.platformSelected"></b-form-select>
        </b-form-group>
          </b-col>
          <b-col sm="6">
            <b-form-group label="Browser:" label-for="input-6">
              <b-form-input id="input-3" placeholder="e.g. Chrome" v-model="form.browser"></b-form-input>
            </b-form-group>
          </b-col>
        </b-row>
        <b-form-group label="Error Message:" label-for="input-7">
          <b-form-textarea id="input-3" rows="4" v-model="form.errorMsg"></b-form-textarea>
        </b-form-group>
        <b-form-group label="Screenshot:" label-for="input-8">
          <b-form-file
            accept="image/*"
            v-model="form.file"
            :state="Boolean(file)"
            placeholder="Choose a file..."
            drop-placeholder="Drop file here..."
          ></b-form-file>
        </b-form-group>
        <b-form-group label="Additional Context:" label-for="input-8">
          <b-form-textarea id="input-3" rows="4" v-model="form.additionalContext"></b-form-textarea>
        </b-form-group>
        <div class="to-right">
          <b-button @click="onSubmit" variant="primary" size="lg">Submit</b-button>
        </div>
      </b-form>
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
