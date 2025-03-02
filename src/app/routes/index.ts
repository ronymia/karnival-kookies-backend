import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { CartRoutes } from '../modules/Carts/cart.route';
import { CategoryRoutes } from '../modules/Categories/categories.route';
import { CouponRoutes } from '../modules/Coupons/coupon.route';
import { DashboardRoutes } from '../modules/Dashboard/dashboard.route';
import { FaqRoutes } from '../modules/Faq/faq.route';
import { FavoriteProductRoutes } from '../modules/FavoriteProduct/favoriteProduct.route';
import { MetaDataRoutes } from '../modules/MetaData/metaData.route';
import { OrderRoutes } from '../modules/Orders/order.route';
import { PackageRoutes } from '../modules/Package/package.route';
import { PaymentRoutes } from '../modules/Payments/payment.route';
import { ProductRoutes } from '../modules/Products/product.route';
import { ReviewRoutes } from '../modules/Reviews/review.route';
import { SubscribersRoutes } from '../modules/Subscribers/subscribers.route';
import { UserRoutes } from '../modules/Users/user.route';

const router = express.Router();

const moduleRoutes = [
  // ... routes
  {
    path: '/v1.0/auth',
    route: AuthRoutes,
  },
  {
    path: '/v1.0/users',
    route: UserRoutes,
  },
  {
    path: '/v1.0/products',
    route: ProductRoutes,
  },
  // {
  //   path: '/v1.0/permission //   route: PermissionRoutes,
  // },
  {
    path: '/v1.0/dashboard',
    route: DashboardRoutes,
  },
  {
    path: '/v1.0/carts',
    route: CartRoutes,
  },
  {
    path: '/v1.0/orders',
    route: OrderRoutes,
  },
  {
    path: '/v1.0/payments',
    route: PaymentRoutes,
  },
  {
    path: '/v1.0/categories',
    route: CategoryRoutes,
  },
  {
    path: '/v1.0/faqs',
    route: FaqRoutes,
  },
  {
    path: '/v1.0/coupons',
    route: CouponRoutes,
  },
  {
    path: '/v1.0/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/v1.0/packages',
    route: PackageRoutes,
  },
  {
    path: '/v1.0/subscribers',
    route: SubscribersRoutes,
  },
  {
    path: '/v1.0/favorite',
    route: FavoriteProductRoutes,
  },
  {
    path: '/v1.0/meta-data',
    route: MetaDataRoutes,
  },
];

moduleRoutes.forEach(({ path, route }) => router.use(path, route));

export default router;
