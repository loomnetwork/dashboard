<template>
  <div class="locale-changer">
    <b-form-select v-model="$i18n.locale" @change="switchLang">
      <option v-for="lang in langs" :key="lang.key" :value="lang.key">{{ lang.localizedName }}</option>
    </b-form-select>
  </div>
</template>

<script>
  import { loadLocale, supportedLocales } from '../i18n'
  import { mapActions, mapMutations, mapState, createNamespacedHelpers } from 'vuex'

  export default {
    name: 'LangSwitcher',
    data() {
      return {
        selectedLang: '',
        langs: [
          {
            key: 'en',
            localizedName: 'English'
          },
          {
            key: 'zh',
            localizedName: '中文'
          }
        ]        
      }
    },
    mounted: function() {

      this.configureLocale()

      // const configureLocale = () => {
      //   let candidateLang = navigator.language || "en"
      //   let res = supportedLocales.filter((lang) => {
      //     candidateLang.includes(lang.key)
      //   })
      // }

    },    
    methods: {
      ...mapMutations([
        'setLocale',
      ]),
      async switchLang(locale) {
        this.setLocale(locale)
        await loadLocale(locale)
        // window.location.pathname = window.location.pathname.replace(/^\/\w{2}/i, locale)
      },
      async configureLocale() {
        let candidateLang = navigator.language || "en"
        let res = this.langs.find(function(lang) {
          return candidateLang.includes(lang.key)
        })
        await loadLocale(res.key)
      }
    },
    computed: mapState([
      'locale'
    ])

  }
</script>

<style lang="scss" scoped>
  .locale-changer {
    max-width: 120px;
    margin: 0 auto;
    .custom-select {
      background-color: transparent;
      border: none;
      font-size: 1rem;
      font-weight: 500;
      color: white;
      &:focus {
        box-shadow: none;
      }

      option {
        background-color: black;
      }
    }
  }
</style>
