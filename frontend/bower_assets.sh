DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
mkdir -p $DIR/public

ln -sfh $DIR/bower_components/font-awesome/fonts $DIR/public/fonts


