<template>
  <b-card>
    <div slot="header" class="d-flex flex-row">
      <b-breadcrumb :items="breadcrumbs" @click="onTitleClicked"></b-breadcrumb>
      <div class="close-btn" @click="onCloseBtnClicked"></div>
    </div>
    <fa v-if="isLoading" icon="spinner" spin/>
    <div v-if="!isLoading && selectedTx">
      <component :is="txInfoComponent" :tx="selectedTx.data"/>
    </div>
    <div v-if="!isLoading && !selectedTx">
      <div v-if="block" class="text-muted">{{ $t('components.blockExplorer.block_info.on') }} <span class="time-tamp"> {{blockTimestamp }}</span></div>
      <div v-if="isVerified" class="text-muted d-flex flex-row align-items-center"><span class="verified-icon"></span>{{ $t('components.blockExplorer.block_info.verified') }}</div>
      <h5 class="text-white">{{ $t('components.blockExplorer.block_info.transactions') }}</h5>
      <TransactionTable v-bind="txTableProps"/>
    </div>
  </b-card>
</template>

<style lang="scss" scoped>
@import '~@/assets/scss/app.scss';

.card {
  background-color: $black2;
  border-color: lighten($body-bg, 10%);
}

div.close-btn {
  width: 23.8px;
  height: 23.8px;
  color: $white;
  outline: none;
  cursor: pointer;

  @include hover-focus {
    background-image: url(../../assets/images/close_icon_hover.svg);
  }
  position: absolute;
  top: 14px;
  right: 26px;
  background-image: url(../../assets/images/close_icon.svg);
}

.breadcrumb {
  flex: 1 1 auto;
  flex-wrap: nowrap;
  margin-bottom: 0;
  padding-left: 0;
  padding-right: 0;
  background-color: transparent;
  font-size: 26px;

  .breadcrumb-item {
    color: $white;
    &::before {
      font-size: 20px;
      color: #ffffff;
    }
    a {
      font-size: 26px;
      font-weight: 300;
      text-align: center;
      color: $blue2;
    }
    span {
      font-size: 26px;
      letter-spacing: 0.5px;
      text-align: left;
      color: #ffffff;
      font-weight: 300;
    }
  }
}

.fa-spinner {
  width: 10vw;
  height: 10vh;
  color: $white;
}

li.active {
  span {
    font-size: 20px;
    text-align: left;
  }
}

.time-tamp {
  color: theme-color('primary');
  font-weight: 600;
}

.node-name {
  font-weight: 600;
  color: theme-color('info');
}

.text-muted,
.text-white {
  font-size: 18px;
  color: #eeeeee !important;
  font-weight: normal !important;
}

//block info
.block-info-card {
  background-color: $black2;
  padding: 45px $block_side_padding;
  border-radius: 3px;
  box-shadow: 12px 1px 15px 5px #101010;
  border: none;
  .card-header {
    border: none;
    padding: 0;
    margin-bottom: 11px;
  }
  .card-body {
    padding: 0;
    text-align: left;
    color: $light_white;
    .text-colored {
      @include important-font();
      margin-bottom: 7px;
      font-size: 18px;
      letter-spacing: 0.4px;
    }
    .verified-icon {
      display: inline-block;
      background: url('../../assets/images/verified.svg');
      margin-right: 8px;
      width: 23px;
      height: 18px;
    }
    h5 {
      font-size: 20px;
      font-weight: 300;
      letter-spacing: 0.5px;
      text-align: center;
      color: #ffffff;
      text-transform: uppercase;
      margin: 13px 0 16px 0;
    }
    div > div > div {
      margin-bottom: 7px;
      a {
        color: theme-color('info');
      }
      &:last-child {
        margin-top: 9px;
      }
    }
  }
}
</style>

<script lang="ts" src="./block-info.ts"></script>
