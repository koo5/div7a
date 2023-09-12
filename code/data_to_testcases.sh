#!/usr/bin/env fish
function _; or status --is-interactive; or exit 1; end

set -x PYTHONUNBUFFERED 1

set -l temp ../.tmp(date --utc +"%s"); mv ../endpoint_tests $temp; rm -rf $temp & time ./data_to_testcases.py ;_

ls -thrlsa ../data/ | wc -l

ls -thrlsa ../endpoint_tests/loan/good_atocalc_autogen/ | wc -l


