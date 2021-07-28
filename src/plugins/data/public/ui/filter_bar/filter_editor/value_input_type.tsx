/*
 * SPDX-License-Identifier: Apache-2.0
 *
 * The OpenSearch Contributors require contributions made to
 * this file be licensed under the Apache-2.0 license or a
 * compatible open source license.
 */

/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

/*
 * Modifications Copyright OpenSearch Contributors. See
 * GitHub history for details.
 */

import { EuiFieldNumber, EuiFieldText, EuiSelect } from '@elastic/eui';
import { InjectedIntl, injectI18n } from '@osd/i18n/react';
import { isEmpty } from 'lodash';
import React, { Component } from 'react';
import { validateParams } from './lib/filter_editor_utils';

interface Props {
  value?: string | number;
  type: string;
  onChange: (value: string | number | boolean) => void;
  onBlur?: (value: string | number | boolean) => void;
  fullWidth?: boolean;
  placeholder: string;
  intl: InjectedIntl;
  controlOnly?: boolean;
  className?: string;
}

class ValueInputTypeUI extends Component<Props> {
  public render() {
    const value = this.props.value;
    let inputElement: React.ReactNode;
    switch (this.props.type) {
      case 'string':
        inputElement = (
          <EuiFieldText
            fullWidth={this.props.fullWidth}
            placeholder={this.props.placeholder}
            value={value}
            onChange={this.onChange}
            controlOnly={this.props.controlOnly}
            className={this.props.className}
          />
        );
        break;
      case 'number':
        inputElement = (
          <EuiFieldNumber
            fullWidth={this.props.fullWidth}
            placeholder={this.props.placeholder}
            value={typeof value === 'string' ? parseFloat(value) : value}
            onChange={this.onChange}
            controlOnly={this.props.controlOnly}
            className={this.props.className}
          />
        );
        break;
      case 'date':
        inputElement = (
          <EuiFieldText
            fullWidth={this.props.fullWidth}
            placeholder={this.props.placeholder}
            value={value}
            onChange={this.onChange}
            onBlur={this.onBlur}
            isInvalid={!isEmpty(value) && !validateParams(value, this.props.type)}
            controlOnly={this.props.controlOnly}
            className={this.props.className}
          />
        );
        break;
      case 'ip':
        inputElement = (
          <EuiFieldText
            fullWidth={this.props.fullWidth}
            placeholder={this.props.placeholder}
            value={value}
            onChange={this.onChange}
            isInvalid={!isEmpty(value) && !validateParams(value, this.props.type)}
            controlOnly={this.props.controlOnly}
            className={this.props.className}
          />
        );
        break;
      case 'boolean':
        inputElement = (
          <EuiSelect
            fullWidth={this.props.fullWidth}
            options={[
              { value: undefined, text: this.props.placeholder },
              {
                value: 'true',
                text: this.props.intl.formatMessage({
                  id: 'data.filter.filterEditor.trueOptionLabel',
                  defaultMessage: 'true',
                }),
              },
              {
                value: 'false',
                text: this.props.intl.formatMessage({
                  id: 'data.filter.filterEditor.falseOptionLabel',
                  defaultMessage: 'false',
                }),
              },
            ]}
            value={value}
            onChange={this.onBoolChange}
            className={this.props.className}
          />
        );
        break;
      default:
        break;
    }

    return inputElement;
  }

  private onBoolChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const boolValue = event.target.value === 'true';
    this.props.onChange(boolValue);
  };

  private onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const params = event.target.value;
    this.props.onChange(params);
  };

  private onBlur = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.onBlur) {
      const params = event.target.value;
      this.props.onBlur(params);
    }
  };
}

export const ValueInputType = injectI18n(ValueInputTypeUI);
