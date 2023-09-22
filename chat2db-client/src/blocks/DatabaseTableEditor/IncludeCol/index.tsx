import React, { useMemo, useState, useContext, useEffect, forwardRef, ForwardedRef, useImperativeHandle } from 'react';
import styles from './index.less';
import classnames from 'classnames';
import { Table, Form, Select, Button } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { Context } from '../index';
import { IColumnItemNew, IIndexIncludeColumnItem } from '@/typings';
import i18n from '@/i18n';

interface IProps {
  includedColumnList: IIndexIncludeColumnItem[];
}

const createInitialData = () => {
  return {
    key: uuidv4(),
    oldName: null,
    name: null,
    tableName: null,
    columnType: null,
    dataType: null,
    defaultValue: null,
    autoIncrement: null,
    comment: null,
    primaryKey: null,
    schemaName: null,
    databaseName: null,
    typeName: null,
    columnSize: null,
    bufferLength: null,
    decimalDigits: null,
    numPrecRadix: null,
    nullableInt: null,
    sqlDataType: null,
    sqlDatetimeSub: null,
    charOctetLength: null,
    ordinalPosition: null,
    nullable: null,
    generatedColumn: null,
  };
};

export interface IIncludeColRef {
  getIncludeColInfo: () => IIndexIncludeColumnItem[];
}

const InitialDataSource = [createInitialData()];

const IncludeCol = forwardRef((props: IProps, ref: ForwardedRef<IIncludeColRef>) => {
  const { includedColumnList } = props;
  const { columnListRef } = useContext(Context);
  const [dataSource, setDataSource] = useState<IIndexIncludeColumnItem[]>(InitialDataSource);
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState(dataSource[0]?.key);
  const isEditing = (record: IIndexIncludeColumnItem) => record.key === editingKey;

  useEffect(() => {
    if (includedColumnList.length) {
      setDataSource(
        includedColumnList.map((t) => {
          return {
            ...t,
            key: uuidv4(),
          };
        }),
      );
    }
  }, [includedColumnList]);

  const columnList: IColumnItemNew[] = useMemo(() => {
    const columnListInfo = columnListRef.current?.getColumnListInfo()?.filter((i) => i.name);
    return columnListInfo || [];
  }, []);

  const edit = (record: IIndexIncludeColumnItem) => {
    form.setFieldsValue({ ...record });
    setEditingKey(record.key);
  };

  const addData = () => {
    const newData = createInitialData();
    setDataSource([...dataSource, newData]);
    edit(newData);
  };

  const deleteData = () => {
    // if (dataSource.length === 1) {
    //   message.warning('至少保留一条数据')
    //   return
    // }

    setDataSource(dataSource.filter((i) => i.key !== editingKey));
  };

  const columns = [
    {
      title: i18n('editTable.label.index'),
      dataIndex: 'index',
      width: '10%',
      render: (text: string, record: IIndexIncludeColumnItem) => {
        return dataSource.findIndex((i) => i.key === record.key) + 1;
      },
    },
    {
      title: i18n('editTable.label.columnName'),
      dataIndex: 'columnName',
      // width: '45%',
      render: (text: string, record: IIndexIncludeColumnItem) => {
        const editable = isEditing(record);
        return editable ? (
          <Form.Item name="columnName" style={{ margin: 0 }}>
            <Select options={columnList.map((i) => ({ label: i.name, value: i.name }))} />
          </Form.Item>
        ) : (
          <div className={styles.editableCell} onClick={() => edit(record)}>
            {text}
          </div>
        );
      },
    },
    // {
    //   title: i18n('editTable.label.prefixLength'),
    //   dataIndex: 'prefixLength',
    //   width: '45%',
    //   render: (text: string, record: IIndexIncludeColumnItem) => {
    //     const editable = isEditing(record);
    //     return editable ? (
    //       <Form.Item name="prefixLength" style={{ margin: 0 }}>
    //         <InputNumber style={{ width: '100%' }} />
    //       </Form.Item>
    //     ) : (
    //       <div className={styles.editableCell} onClick={() => edit(record)}>
    //         {text}
    //       </div>
    //     );
    //   },
    // },
  ];

  const onValuesChange = (changedValues: any, allValues: any) => {
    const newDataSource = dataSource?.map((i) => {
      if (i.key === editingKey) {
        return {
          ...i,
          ...allValues,
        };
      }
      return i;
    });
    setDataSource(newDataSource);
  };

  const getIncludeColInfo = () => {
    const includeColInfo: IIndexIncludeColumnItem[] = [];
    dataSource.forEach((t) => {
      columnList.forEach((columnItem) => {
        if (t.name === columnItem.name) {
          includeColInfo.push({
            ...columnItem,
          });
        }
      });
    });
    return includeColInfo;
  };

  useImperativeHandle(ref, () => ({
    getIncludeColInfo,
  }));

  return (
    <div className={classnames(styles.box)}>
      <div className={styles.indexListHeader}>
        <Button onClick={addData}>{i18n('editTable.button.add')}</Button>
        <Button onClick={deleteData}>{i18n('editTable.button.delete')}</Button>
      </div>
      <Form form={form} onValuesChange={onValuesChange}>
        <Table pagination={false} rowKey="key" columns={columns} dataSource={dataSource} />
      </Form>
    </div>
  );
});

export default IncludeCol;
