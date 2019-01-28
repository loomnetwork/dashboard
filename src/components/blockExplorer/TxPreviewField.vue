<template>
  <div>
    <span class="text-label">{{curLabel}}</span>
    <slot>
      <span class="text-colored">{{curValue}}</span>
    </slot>
  </div>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/_mixin.scss';
@import '~@/assets/scss/_variables.scss';
.card-body {
  .text-label,
  .text-colored,
  .text-muted {
    font-size: 18px;
  }
}

.text-label {
  color: $light_white;
  letter-spacing: 0.4px;
}
.permalink {
  .text-colored {
    @include normal-font();
    color: $blue2;
  }
}

.kind {
  .text-colored {
    @include normal-font();
    text-transform: capitalize;
    color: $primary;
  }
}

.author {
  .text-colored {
    @include normal-font();
    color: $info_green;
  }
}

.address {
  .text-colored {
    color: $light_green;
    font-weight: normal;
  }
}

.text-normal {
  .text-colored {
    color: #ffffff;
    font-weight: normal;
  }
}

.tx-title {
  .text-colored {
    font-size: 24px;
  }
}
</style>

<script lang="ts" src="./tx-preview-field.ts"></script>
