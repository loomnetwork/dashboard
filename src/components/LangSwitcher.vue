<template>
  <div class="locale-changer">
    <b-form-select v-model="$i18n.locale" @change="showLang">
      <option v-for="lang in langs" :key="lang.key" :value="lang.key">{{ lang.localizedName }}</option>
    </b-form-select>
  </div>
</template>

<script>
  import { supportedLocales } from '../i18n'

  export default {
    name: 'LangSwitcher',
    data() {
      return {}
    },
    methods: {
      showLang(locale) {
        window.location.pathname = window.location.pathname.replace(/^\/\w{2}/i, locale)
      }
    },
    computed: {
      langs() {
        // return supportedLocales
        // only 3 languages now, so won't import directly from i18n
        return [
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
    }
  }
</script>

<style lang="scss" scoped>
  .locale-changer {
    .custom-select {
      background-color: transparent;
      border: none;
      color: white;
      padding-left: 20px;
      margin-top: 5px;
      font-size: 18px;
      &:focus {
        box-shadow: none;
      }

      option {
        background-color: black;
      }
    }
  }
</style>
