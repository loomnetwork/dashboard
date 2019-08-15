<template>
  <div class="locale-changer">
    <b-form-select v-model="locale">
      <option v-for="lang in langs" :key="lang.key" :value="lang.key">{{ lang.localizedName }}</option>
    </b-form-select>
  </div>
</template>
<script lang="ts">
import { Component, Watch, Vue } from "vue-property-decorator"
import { loadLocale, isLocaleSupported } from "@/i18n"

@Component
export default class LangSwitcher extends Vue {
  langs = [
    {
      key: "en",
      localizedName: "English",
    },
    {
      key: "zh",
      localizedName: "中文",
    },
    {
      key: "es",
      localizedName: "Español",
    },
    {
      key: "ja",
      localizedName: "日本語 ",
    },
    {
      key: "th",
      localizedName: "ภาษาไทย",
    },
    {
      key: "ko",
      localizedName: "조선말/한국어",
    },
  ]

  locale = "en"

  @Watch("locale")
  async switchLang(locale) {
    await loadLocale(locale)

  }
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
