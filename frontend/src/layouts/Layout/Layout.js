import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import Header from '../Header/Header.js';
import styles from './Layout.module.scss'

const cx = classNames.bind(styles);

function Layout({ children }) {
    return (
        <div className={cx('wrapper')}>
            <Header />
            <div className={cx('container')}>
                <div className={cx('content')}>{children}</div>
            </div>
        </div>
    );
}

Layout.propTypes = {
    children: PropTypes.node.isRequired,
};

export default Layout;
