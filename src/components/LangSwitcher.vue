<template>
  <div class="locale-changer">
    <b-form-select v-model="$i18n.locale" @change="showLang">
      <option v-for="lang in langs" :key="lang.key" :value="lang.key">{{ lang.localizedName }}</option>
    </b-form-select>
  </div>
</template>

<script lang="ts">
  import { supportedLocales } from "../i18n"

  export default {
    name: "LangSwitcher",
    data() {
      return {}
    },
    methods: {
      showLang(locale) {
        window.location.pathname = window.location.pathname.replace(/^\/\w{2}/i, locale)
      },
    },
    computed: {
      langs() {
        // return supportedLocales
        // only 3 languages now, so won't import directly from i18n
        return [
          {
            key: "en",
            localizedName: "English",
          },
          {
            key: "zh",
            localizedName: "中文",
          },
        ]
      },
    },
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
