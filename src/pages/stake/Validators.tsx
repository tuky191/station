import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { sort } from "ramda"
import VerifiedIcon from "@mui/icons-material/Verified"
import { readPercent } from "@terra.kitchen/utils"
import { Validator } from "@terra-money/terra.js"
/* FIXME(terra.js): Import from terra.js */
import { BondStatus } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { bondStatusFromJSON } from "@terra-money/terra.proto/cosmos/staking/v1beta1/staking"
import { combineState } from "data/query"
import { useOracleParams } from "data/queries/oracle"
import { useValidators } from "data/queries/staking"
import { useDelegations, useUnbondings } from "data/queries/staking"
import { getCalcUptime, getCalcVotingPowerRate } from "data/Terra/TerraAPI"
import { useTerraValidators } from "data/Terra/TerraAPI"
import { Page, Card, Table, Flex, Grid } from "components/layout"
import { Button } from "components/general"
import { TooltipIcon } from "components/display"
import { Read } from "components/token"
import WithSearchInput from "pages/custom/WithSearchInput"
import ProfileIcon from "./components/ProfileIcon"
import Uptime from "./components/Uptime"
import { ValidatorJailed } from "./components/ValidatorTag"
import styles from "./Validators.module.scss"

const Validators = () => {
  const { t } = useTranslation()

  const { data: oracleParams, ...oracleParamsState } = useOracleParams()
  const { data: validators, ...validatorsState } = useValidators()
  const { data: delegations, ...delegationsState } = useDelegations()
  const { data: undelegations, ...undelegationsState } = useUnbondings()
  const { data: TerraValidators, ...TerraValidatorsState } =
    useTerraValidators()

  const state = combineState(
    oracleParamsState,
    validatorsState,
    delegationsState,
    undelegationsState,
    TerraValidatorsState
  )

  const activeValidators = useMemo(() => {
    if (!(oracleParams && validators && TerraValidators)) return null

    const calcRate = getCalcVotingPowerRate(TerraValidators)
    const calcUptime = getCalcUptime(oracleParams)

    return validators
      .filter(({ status }) => !getIsUnbonded(status))
      .map((validator) => {
        const { operator_address } = validator

        const TerraValidator = TerraValidators.find(
          (validator) => validator.operator_address === operator_address
        )

        const voting_power_rate = calcRate(operator_address)
        const uptime = calcUptime(TerraValidator)

        return {
          ...TerraValidator,
          ...validator,
          voting_power_rate,
          uptime,
        }
      })
      .sort(
        (a, b) =>
          Number(b.rewards_30d) - Number(a.rewards_30d) ||
          Number(b.uptime) - Number(a.uptime) ||
          Number(a.commission.commission_rates.rate) -
            Number(b.commission.commission_rates.rate) ||
          Number(b.voting_power_rate) - Number(a.voting_power_rate)
      )
  }, [TerraValidators, oracleParams, validators])

  const renderCount = () => {
    if (!validators) return null
    const count = validators.filter(({ status }) => getIsBonded(status)).length
    return t("{{count}} active validators", { count })
  }

  const [collapsed, setCollapsed] = useState(true)

  const dataSource = useMemo(() => {
    if (!activeValidators) return

    const sorted = sort(
      (a, b) => Number(b.voting_power_rate) - Number(a.voting_power_rate),
      activeValidators
    )

    const superm = collectSumBiggerThanThreshold(
      sorted,
      ({ voting_power_rate }) => voting_power_rate,
      1 / 3
    )

    const minorValidators = activeValidators.filter((a) =>
      superm.every((s) => s.operator_address !== a.operator_address)
    )

    return sort(
      (a, b) =>
        Number(b.uptime) - Number(a.uptime) ||
        Number(a.commission.commission_rates.rate) -
          Number(b.commission.commission_rates.rate) ||
        Number(b.voting_power_rate) - Number(a.voting_power_rate),
      collapsed ? minorValidators : activeValidators
    )
  }, [activeValidators, collapsed])

  const render = (keyword: string) => {
    if (!dataSource) return null

    const renderToggle = () => {
      if (!collapsed) return null

      return (
        <td colSpan={5}>
          <Flex className={styles.flex}>
            <section className={styles.super}>
              <TooltipIcon
                content={
                  <>
                    <li>Validators with accumulative voting power of 33%</li>
                    <li>The network can stop if super majority colludes</li>
                  </>
                }
              >
                Super majority
              </TooltipIcon>
              are hidden to help decentralize
            </section>

            <Button size="small" onClick={() => setCollapsed(false)}>
              {t("Show")}
            </Button>
          </Flex>
        </td>
      )
    }

    return (
      <Table
        dataSource={dataSource}
        filter={({ description: { moniker }, operator_address }) => {
          if (!keyword) return true
          return [moniker.toLowerCase(), operator_address].some((text) =>
            text.includes(keyword.toLowerCase())
          )
        }}
        sorter={(a, b) => Number(a.jailed) - Number(b.jailed)}
        initialSorterKey="rewards"
        rowKey={({ operator_address }) => operator_address}
        columns={[
          {
            title: t("Moniker"),
            dataIndex: ["description", "moniker"],
            defaultSortOrder: "asc",
            sorter: ({ description: a }, { description: b }) =>
              a.moniker.localeCompare(b.moniker),
            render: (moniker, validator) => {
              const { operator_address, jailed } = validator
              const { contact } = validator

              const delegated = delegations?.find(
                ({ validator_address }) =>
                  validator_address === operator_address
              )

              const undelegated = undelegations?.find(
                ({ validator_address }) =>
                  validator_address === operator_address
              )

              return (
                <Flex start gap={8}>
                  <ProfileIcon src={validator.picture} size={22} />

                  <Grid gap={2}>
                    <Flex gap={4} start>
                      <Link
                        to={`/validator/${operator_address}`}
                        className={styles.moniker}
                      >
                        {moniker}
                      </Link>

                      {contact?.email && (
                        <VerifiedIcon
                          className="info"
                          style={{ fontSize: 12 }}
                        />
                      )}

                      {jailed && <ValidatorJailed />}
                    </Flex>

                    {(delegated || undelegated) && (
                      <p className={styles.muted}>
                        {[
                          delegated && t("Delegated"),
                          undelegated && t("Undelegated"),
                        ]
                          .filter(Boolean)
                          .join(" | ")}
                      </p>
                    )}
                  </Grid>
                </Flex>
              )
            },
          },
          {
            title: t("Voting power"),
            dataIndex: "voting_power_rate",
            defaultSortOrder: "desc",
            sorter: (
              { voting_power_rate: a = 0 },
              { voting_power_rate: b = 0 }
            ) => a - b,
            render: (value = 0) => readPercent(value),
            align: "right",
          },
          {
            title: t("Commission"),
            dataIndex: ["commission", "commission_rates"],
            defaultSortOrder: "asc",
            sorter: (
              { commission: { commission_rates: a } },
              { commission: { commission_rates: b } }
            ) => a.rate.toNumber() - b.rate.toNumber(),
            render: ({ rate }: Validator.CommissionRates) =>
              readPercent(rate.toString(), { fixed: 2 }),
            align: "right",
          },
          {
            title: t("Uptime"),
            dataIndex: "uptime",
            defaultSortOrder: "desc",
            key: "uptime",
            sorter: ({ uptime: a = 0 }, { uptime: b = 0 }) => a - b,
            render: (value) => !!value && <Uptime>{value}</Uptime>,
            align: "right",
          },
          {
            title: t("Rewards"),
            tooltip: t("Estimated monthly rewards with 100 Luna staked"),
            dataIndex: "rewards_30d",
            defaultSortOrder: "desc",
            key: "rewards", // initial sorter key
            sorter: ({ rewards_30d: a = "0" }, { rewards_30d: b = "0" }) =>
              Number(a) - Number(b),
            render: (value) =>
              !!value && (
                <Read
                  amount={Number(value) * 100}
                  denom="uluna"
                  decimals={0}
                  fixed={6}
                />
              ),
            align: "right",
          },
        ]}
      >
        {renderToggle()}
      </Table>
    )
  }

  return (
    <Page title={t("Validators")} extra={renderCount()} sub>
      <Card {...state}>
        <WithSearchInput>{render}</WithSearchInput>
      </Card>
    </Page>
  )
}

export default Validators

/* helpers */
export const getIsBonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_BONDED

export const getIsUnbonded = (status: BondStatus) =>
  bondStatusFromJSON(BondStatus[status]) === BondStatus.BOND_STATUS_UNBONDED

function collectSumBiggerThanThreshold<T>(
  list: T[],
  getValue: (item: T) => number,
  threshold: number
): T[] {
  interface V {
    list: T[]
    value: number
  }

  const fn = (acc: V, index = 0): V => {
    const cur = list[index]
    const nextValue = acc.value + getValue(cur)

    if (nextValue < threshold)
      return fn({ list: [...acc.list, cur], value: nextValue }, index + 1)

    return acc
  }

  return fn({ list: [], value: 0 }).list
}
