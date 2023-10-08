import { Checkbox, Text } from '@nextui-org/react';
import React from 'react';
import { SettingIds } from '../../../../common/constants';
import useSettingState from '../../../common/hooks/useSettingState';
import styles from './Checkbox.module.css';

export default function AlwaysPresent() {
  const [value, setValue] = useSettingState(SettingIds.ALWAYS_PRESENT);

  return (
    <Checkbox isSelected={value} onChange={(boolean) => setValue(boolean)}>
      <div className={styles.checkboxLabel}>
        <Text size={14} css={{ margin: 0 }}>
          Always Present
        </Text>
        <Text size={14} color="#999" css={{ margin: 0 }}>
          Prevent the chat from being hidden when clicked away.
        </Text>
      </div>
    </Checkbox>
  );
}
