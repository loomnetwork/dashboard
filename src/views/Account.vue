<template>
  <div class="container mt-5 pt-5">
    <SubHeader :sub-title="subtitle"></SubHeader>
    <section id="account" class="row">
      <div v-if="betaKey === null" class="mx-auto col-md-3 custom-modal">
        <div class="modal-content">
          <div slot="modal-header" class="w-100">
            <h6 class="mx-auto">Fetching tester keys...
            </h6>            
          </div>
        </div>
      </div>
      <div class="mx-auto col-12 download-links mb-3">
        <div class="p-2 ">
            <p class="mx-auto">Download alpha game client:</p>            
            <a class="mx-auto btn" target="_blank" href="https://loom.games/alphabuilds/alpha-latest-pc.zip"><i class="fab fa-windows"></i>Windows</a>
            <a class="mx-auto btn" target="_blank" href="https://loom.games/alphabuilds/alpha-latest-mac.zip"><i class="fab fa-apple"></i>Mac</a>
            <a class="mx-auto btn" target="_blank" href="https://loom.games/alphabuilds/alpha-latest-android.apk"><i class="fab fa-android"></i>Android</a>            
            <a class="mx-auto btn" target="_blank" href="https://goo.gl/forms/HZuDb25UrJDGx8qk2"><i class="fab fa-apple"></i>iOS</a>            
        </div>
      </div>
      <div v-if="betaKey.length == 0" class="mx-auto col-md-3 custom-modal">
        <div class="modal-content">
          <div slot="modal-header" class="w-100">
            <h6 class="mx-auto">Sorry, no tester keys found. If this is a mistake, try logging out and sign back in, otherwise please email <a href="mailto:support@loomx.io" class="text-primary">support@loomx.io</a> for further assistance
            </h6>            
          </div>
        </div>
      </div>
      <div v-else v-for="(item, index) in betaKey" :key="index" class="col-md-3 custom-modal">
        <div class="modal-content">
          <div slot="modal-header" class="w-100">
            <h6 class="mx-auto">Tester Key {{index + 1}}
            </h6>            
          </div>
          <code>{{item.Key}}</code>
          <button v-clipboard:copy="item.Key" class="btn btn-sm btn-dark mt-1">Copy</button>
          <button v-if="isUser" @click="shareKey(item.Key)" v-clipboard:copy="shareUrl(item.Key)" class="btn btn-sm btn-success mt-1">Share</button>          
        </div>

        <!-- <img src="../assets/user-avatar.jpg" alt="">
        
        <input type="text" placeholder="your name" class="mb-5">
        <h5>Change your password</h5>
        <input type="text" placeholder="your password">
        <input type="text" placeholder="new password">
        <input type="text" placeholder="confirm new password">
        <a class="custom-btn">
          Save
        </a> -->
      </div>
    </section>

    <b-modal id="shareKeyModal" size="sm" class="custom-modal" >
      <div slot="modal-header" class="w-100">
        Share this link with your friend:
      </div>

      <p class="card bg-dark">{{shareUrl()}}</p>
      
      <div slot="modal-footer" class="w-100">
        <button disabled="disabled" class="disabled btn-outline-success">Copied to Clipboard</button>
        <!-- TODO: Add modal footer -->
        <!-- <p class="text-center rmv-spacing">Modal Footer Content</p> -->
      </div>
    </b-modal>
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css" integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU" crossorigin="anonymous">
  </div>
</template>


<script>
  import Vue from 'vue'
  import { Component, Watch } from 'vue-property-decorator'
  import SubHeader from '../components/SubHeader'  
  import VueClipboard from 'vue-clipboard2'
  import axios from 'axios'
  Vue.use(VueClipboard)

  @Component({
    components: {
      SubHeader
    },
    props: {
      testerKey: String,
    },
  })
  export default class Account extends Vue {
    betaKey = []
    isUser = false
    sharedKey = ""
    subtitle = this.testerKey ? "Your Invite" : 'My Inventory' 

    async mounted() {
      let instance =  this.initInstance()
      try {
        let response = await instance.get("/user/keys")
        this.betaKey = response.data
        this.isUser = true
        this.$forceUpdate()
      } catch(err) {
        console.log(err);
        this.betaKey = []

        if (this.testerKey != undefined) {
          this.betaKey.push(
            {
              Key: this.testerKey,
            }
          )
        } 
      }
    }

    shareUrl(key) {
      var _key = key || this.sharedKey
      return `${window.location.origin}/share/testerKey?testerKey=${_key}`
    }

    shareKey(key) {
      this.sharedKey = key;
  	  this.$root.$emit('bv::show::modal', 'shareKeyModal')    
    }

    initInstance() {
      let instance = axios.create({
        headers: { 'Authorization' : `Bearer ${localStorage.getItem('accessToken')}` }
      })
      return instance
    }
  }
</script>

<style lang="scss" scoped>
  #account .download-links {
   background-color: #111;
    box-shadow: inset 0 0 5px 5px #000;
    border-radius: 10px;

    a.btn.mx-auto {
      margin-top: 0;
    }
  }
  code {
    background: #333;
    color: greenyellow;
  }
  #account {
    padding: 60px 0;
    img, input {
      display: block;
      margin: 0 auto;
    }
    img {
      margin-bottom: 48px;
    }
    input {
      width: 100%;
      padding: 3px 12px;
      margin-bottom: 12px;
    }
    h5 {
      margin-bottom: 24px;
    }
    a {
      margin: 36px auto 0 auto;
    }
  }
</style>
