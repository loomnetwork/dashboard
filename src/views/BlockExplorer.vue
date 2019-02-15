<template>
  <div class="faucet-with-navbar">
    <div class="faucet-content">
      <div>
          <BlockList ref="blockList" class="block-list" :blockchain="blockchain"
                    :showConnectionDropdown="showConnectionDropdown"
                    :searchQuery="curSearchQuery"/>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@import '~@/assets/scss/_mixin.scss';
@import '~@/assets/scss/_variables.scss';

.block-list {
  padding: 20px;
  .pointer-only {
    user-select: none;
    cursor: default;
  }

  //table
  .blocks-table {
    width: 100%;
    @include normal-font();
    color: #ffffff;
    thead {
      tr {
        height: 52px;
        line-height: 52px;
      }
      th {
        font-size: 20px;
        letter-spacing: 2px;
        text-align: left;
        font-weight: normal !important;
        position: relative;
        background-color: theme-color('muted') !important;
        padding: 0;
        &::before,
        &::after {
          bottom: 8px !important;
        }
      }
    }
    tr {
      font-size: 18px;
      letter-spacing: 1.8px;
      text-align: left;
      line-height: 33px;
      height: 67px;
      td {
        border-bottom: solid $dark-border;
        padding-top: 16px;
      }
    }
    th:not(:first-child),
    td:not(:first-child) {
      text-align: center !important;
    }
    th:first-child,
    td:first-child {
      width: 144px;
      padding-left: 40px;
    }
    th:last-child,
    td:last-child {
      text-align: right !important;
      padding-right: 40px;
    }
    th:last-child {
      padding-right: 9.8em !important;
    }
    th:nth-child(2) {
      min-width: 220px;
    }

    .hash-value {
      display: inline-block;
      width: 11em;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .pagination {
    .page-link {
      border: none;
      background: none !important;
    }

    li {
      // min width (page 9999 doesn't fit in 24px
      min-width: 24px;
      height: 24px;
      margin: 6px;
      a {
        margin-left: 0;
        padding: 0 !important;
        font-size: 16px;
        font-weight: 600;
        text-align: center;
        color: #354168;
        line-height: 24px;
        height: 24px;
        &:focus {
          box-shadow: none;
        }
      }
    }
    .active a {
      background-color: $primary !important;
    }

    .page-item {
      &.disabled {
        opacity: 0.5
      }
      &:first-child.disabled {
        background: url('../assets/images/verry_back_arrow_left.svg') no-repeat center;
        transform: scaleX(1);
      }
      &:first-child {
        // for some reason this does not showup
        // background: url('../assets/images/verry_back_arrow_left_active.svg') no-repeat center;
        background: url('../assets/images/verry_back_arrow_right_active.svg') no-repeat center;
        transform: scaleX(-1);
      }

      &:nth-child(2).disabled {
        background: url('../assets/images/back_arrow.svg') no-repeat center;
        transform: scaleX(1);
      }

      &:nth-child(2) {
        // this one neither
        // background: url('../assets/images/back_arrow_active.svg') no-repeat center;
        background: url('../assets/images/forward_arrow_active.svg') no-repeat center;
        transform: scaleX(-1);
      }

      &:last-child.disabled {
        background: url('../assets/images/verry_back_arrow_right.svg') no-repeat center;
      }

      &:last-child {
        background: url('../assets/images/verry_back_arrow_right_active.svg') no-repeat center;
      }
      &:nth-last-child(2).disabled {
        background: url('../assets/images/forward_arrow.svg') no-repeat center;
      }

      &:nth-last-child(2) {
        background: url('../assets/images/forward_arrow_active.svg') no-repeat center;
      }
    }
  }
}
</style>

<script lang="ts" src="./block-explorer"></script>
